package com.github.senocak.security

import com.fasterxml.jackson.databind.ObjectMapper
import com.github.senocak.exception.RestExceptionHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component
import java.io.IOException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

@Component
class JwtAuthenticationEntryPoint(val objectMapper: ObjectMapper) : AuthenticationEntryPoint {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    @Throws(IOException::class)
    override fun commence(request: HttpServletRequest, response: HttpServletResponse, ex: AuthenticationException) {
        log.error("Responding with unauthorized error. Message - ${ex.message}")
        val responseEntity: ResponseEntity<Any> = RestExceptionHandler().handleUnAuthorized(ex = RuntimeException(ex.message))
        response.writer.write(objectMapper.writeValueAsString(responseEntity.body))
        response.status = HttpServletResponse.SC_UNAUTHORIZED
        response.contentType = "application/json"
    }
}