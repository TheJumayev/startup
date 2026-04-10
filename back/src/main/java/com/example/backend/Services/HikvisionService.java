package com.example.backend.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.auth.AuthScope;
import org.apache.hc.client5.http.auth.UsernamePasswordCredentials;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.auth.BasicCredentialsProvider;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.protocol.HttpClientContext;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URL;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Service
public class HikvisionService {

    private static final String CAMERA_IP = "172.20.172.100";
    private static final String USERNAME = "admin";
    private static final String PASSWORD = "1qaz2wsx";
    private static final String LOCAL_SERVER = "http://172.172.202.39:3000"; // local HTTP host for Hikvision access
    private static final Path FACE_IMAGE_DIR = Paths.get("backend/face-images");     // root folder for images

    private final ObjectMapper mapper = new ObjectMapper();

    public boolean createUserOnDevice(Integer hemisId, String name, String imageUrl, String groupName) {
        groupName = groupName.replaceAll(" ", "_");
        String url = "http://" + CAMERA_IP + "/ISAPI/AccessControl/UserInfo/Record?format=json";
        log.info("➡️ Sending to Hikvision: {}", url);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

        Map<String, Object> payload = Map.of(
                "UserInfo", Map.of(
                        "employeeNo", hemisId.toString(),
                        "name", name,
                        "userType", "normal",
                        "gender", "male",
                        "Valid", Map.of(
                                "enable", true,
                                "beginTime", LocalDateTime.now().minusYears(1).format(formatter),
                                "endTime", LocalDateTime.now().plusYears(1).format(formatter)
                        ),
                        "doorRight", "1"
                )
        );

        boolean created = sendDigestRequest(url, payload);
        if (created) {
            log.info("✅ User '{}' created, preparing face image...", name);
            try {
                String localImageUrl = downloadAndServeImage(imageUrl, groupName, hemisId);
                return uploadFaceImage(hemisId, localImageUrl);
            } catch (Exception e) {
                log.error("🚨 Could not process image for {}: {}", name, e.getMessage());
            }
        }
        return false;
    }

    /** 🔹 Downloads image and returns local server URL */
    private String downloadAndServeImage(String imageUrl, String groupName, Integer hemisId) throws IOException {
        Path groupFolder = FACE_IMAGE_DIR.resolve(groupName);
        if (!Files.exists(groupFolder)) {
            Files.createDirectories(groupFolder);
        }

        Path localPath = groupFolder.resolve(hemisId + ".jpg");
        log.info("⬇️ Downloading image from {} to {}", imageUrl, localPath);

        try (InputStream in = new URL(imageUrl).openStream()) {
            Files.copy(in, localPath, StandardCopyOption.REPLACE_EXISTING);
        }

        // Local HTTP path that Hikvision can access
        String localUrl = LOCAL_SERVER + "/backend/face-images/" + groupName + "/" + hemisId + ".jpg";
        log.info("🌐 Local image URL for camera: {}", localUrl);
        return localUrl;
    }

    /** 🔹 Upload face photo via local HTTP URL */
    public boolean uploadFaceImage(Integer hemisId, String imageUrl) {
        String url = "http://" + CAMERA_IP + "/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json";
        log.info("📤 Uploading face for user {} via URL: {}", hemisId, imageUrl);

        Map<String, Object> payload = Map.of(
                "faceLibType", "blackFD",
                "FDID", "1",
                "FPID", String.valueOf(hemisId),
                "faceURL", imageUrl
        );

        boolean success = sendDigestRequest(url, payload);
        if (success) {
            log.info("✅ Face uploaded successfully for user {}", hemisId);
        } else {
            log.error("❌ Face upload failed for user {}", hemisId);
        }
        return success;
    }

    /** 🔹 Generic Digest-auth POST request */
    private boolean sendDigestRequest(String url, Map<String, Object> payload) {
        try {
            BasicCredentialsProvider provider = new BasicCredentialsProvider();
            provider.setCredentials(
                    new AuthScope(CAMERA_IP, 80),
                    new UsernamePasswordCredentials(USERNAME, PASSWORD.toCharArray())
            );

            try (CloseableHttpClient client = HttpClients.custom()
                    .setDefaultCredentialsProvider(provider)
                    .build()) {

                HttpPost post = new HttpPost(url);
                post.setEntity(new StringEntity(mapper.writeValueAsString(payload), ContentType.APPLICATION_JSON));
                HttpClientContext context = HttpClientContext.create();

                try (CloseableHttpResponse response = client.execute(post, context)) {
                    int status = response.getCode();
                    String responseBody = response.getEntity() != null
                            ? new String(response.getEntity().getContent().readAllBytes())
                            : "";
                    log.info("📥 [{}] Response: {}", status, responseBody);

                    return status == 200 || status == 201;
                }
            }
        } catch (IOException e) {
            log.error("🚨 Hikvision connection error: {}", e.getMessage());
        }
        return false;
    }
}
