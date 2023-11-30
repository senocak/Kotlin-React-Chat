package com.github.senocak.config

import com.github.senocak.security.JwtAuthenticationEntryPoint
import com.github.senocak.security.JwtAuthenticationFilter
import org.springframework.boot.autoconfigure.security.servlet.PathRequest
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.util.matcher.AntPathRequestMatcher

@Configuration
@EnableWebSecurity
class WebSecurityConfig(
    private val unauthorizedHandler: JwtAuthenticationEntryPoint,
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
) {

    @Bean
    fun securityFilterChainDSL(http: HttpSecurity): SecurityFilterChain {
        http {
            cors {}
            csrf { disable() }
            exceptionHandling { authenticationEntryPoint = unauthorizedHandler }
            //httpBasic {}
            authorizeRequests {
                authorize("/api/v1/auth/**", permitAll)
                authorize("/api/v1/swagger/**", permitAll)
                authorize("/swagger**/**", permitAll)
                authorize("/ws**/**", permitAll)
                authorize(PathRequest.toH2Console(), permitAll) // "/h2-console**/**" not working
                authorize(matches = anyRequest, access = authenticated)
            }
            sessionManagement { sessionCreationPolicy = SessionCreationPolicy.STATELESS }
            headers { frameOptions { disable() } }
            addFilterBefore<UsernamePasswordAuthenticationFilter>(filter = jwtAuthenticationFilter)
        }
        return http.build()
    }

    //@Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain =
        http
            .cors { it.disable() }
            .csrf { it.disable() }
            .exceptionHandling { it.authenticationEntryPoint(unauthorizedHandler) }
            .authorizeHttpRequests {
                it
                    .requestMatchers(AntPathRequestMatcher("/api/v1/auth/**")).permitAll()
                    .requestMatchers(AntPathRequestMatcher("/api/v1/swagger/**")).permitAll()
                    .requestMatchers(AntPathRequestMatcher("/swagger**/**")).permitAll()
                    .requestMatchers(AntPathRequestMatcher("/ws**/**")).permitAll()
                    .requestMatchers(AntPathRequestMatcher("/h2-console**/**")).permitAll()
                    .anyRequest().authenticated()
            }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .headers { it.frameOptions { foc -> foc.disable() } }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
            .build()
}
