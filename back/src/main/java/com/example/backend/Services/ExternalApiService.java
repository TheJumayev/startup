package com.example.backend.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExternalApiService {

    private final RestTemplate restTemplate;

    private static final String BASE_URL = "https://student.buxpxti.uz/rest/";

    public ResponseEntity<?> sendRequest(
            String endpoint,
            HttpMethod method,
            Map<String, String> headers,
            Map<String, Object> queryParams,
            Object body
    ) {
        // Build full URL
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(BASE_URL + endpoint);
        if (queryParams != null) {
            queryParams.forEach(builder::queryParam);
        }
        String fullUrl = builder.toUriString();

        // Prepare headers
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        if (headers != null) {
            headers.forEach(httpHeaders::set);
        }

        HttpEntity<Object> requestEntity = new HttpEntity<>(body, httpHeaders);

        try {
            return restTemplate.exchange(fullUrl, method, requestEntity, Object.class);
        } catch (HttpStatusCodeException e) {
            System.out.println("❌ HTTP error: " + e.getStatusCode());
            System.out.println("❌ Response body: " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            System.out.println("❌ Unknown error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("API request error: " + e.getMessage());
        }
    }
}
