package com.example.backend.Security;

import com.example.backend.Repository.UserRepo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MyFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepo userRepo;

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }
        return request.getRemoteAddr();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws IOException, ServletException {

        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        String realIp = getClientIp(request);

        System.out.println("==============================================");
        System.out.println("Method: " + method);
        System.out.println("Path:   " + requestPath);
        System.out.println("Client: " + realIp);
        System.out.println("==============================================");

        // JWT Token ni headerdan olish
        String token = request.getHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7); // "Bearer " ni olib tashlash
            try {
                if (jwtService.validateToken(token)) {
                    String userId = jwtService.extractSubjectFromJwt(token);
                    UserDetails userDetails = userRepo.findById(UUID.fromString(userId)).orElse(null);
                    if (userDetails != null) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                System.out.println("JWT Token xatosi: " + e.getMessage());
                // Token noto'g'ri — davom etamiz, permitAll endpointlar ishlaydi
            }
        }

        filterChain.doFilter(request, response);
    }
}
