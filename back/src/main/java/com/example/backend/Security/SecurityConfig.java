package com.example.backend.Security;

import com.example.backend.Entity.User;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepo userRepo;
    private final MyFilter myFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(
                        auth -> auth
                                // Auth endpointlar
                                .requestMatchers("/api/v1/auth/login").permitAll()
                                .requestMatchers("/api/v1/auth/refresh").permitAll()
                                // Student login/register
                                .requestMatchers("/api/v1/students/login").permitAll()
                                .requestMatchers("/api/v1/students/register").permitAll()
                                // Students CRUD
                                .requestMatchers("/api/v1/students/**").permitAll()
                                .requestMatchers("/api/v1/students").permitAll()
                                // Groups
                                .requestMatchers("/api/v1/groups/**").permitAll()
                                .requestMatchers("/api/v1/groups").permitAll()
                                // Subjects
                                .requestMatchers("/api/v1/subjects/**").permitAll()
                                .requestMatchers("/api/v1/subjects").permitAll()
                                // Curriculum
                                .requestMatchers("/api/v1/curriculm/**").permitAll()
                                .requestMatchers("/api/v1/curriculm").permitAll()
                                // Admin
                                .requestMatchers("/api/v1/admin/**").permitAll()
                                // Files
                                .requestMatchers("/api/v1/file/**").permitAll()
                                // Superadmin
                                .requestMatchers("/api/v1/superadmin/**").permitAll()
                                // Static resources
                                .requestMatchers("/", "/index.html", "/static/**", "/*.js", "/*.css", "/*.ico", "/*.json", "/*.jpg").permitAll()
                                // OPTIONS (CORS preflight)
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .anyRequest().authenticated()
                )
                .addFilterBefore(myFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public UserDetailsService users() {
        return username -> {
            User user = userRepo.findByPhone(username).orElseThrow();
            return user;
        };
    }

    @Bean
    public static PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}