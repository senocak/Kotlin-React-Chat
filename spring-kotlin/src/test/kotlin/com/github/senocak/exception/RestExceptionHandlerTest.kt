package com.github.senocak.exception

import com.github.senocak.domain.dto.ExceptionDto
import com.github.senocak.util.OmaErrorMessageType
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.HttpMediaTypeNotSupportedException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.servlet.NoHandlerFoundException
import java.util.Arrays
import java.util.Optional
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue

@Tag("unit")
@ExtendWith(MockitoExtension::class)
@DisplayName("Unit Tests for RestExceptionHandler")
class RestExceptionHandlerTest {
    private val restExceptionHandler: RestExceptionHandler = RestExceptionHandler()

    @Test
    fun givenExceptionWhenHandleBadRequestExceptionThenAssertResult() {
        // Given
        val ex: Exception = BadCredentialsException("lorem")
        // When
        val handleBadRequestException: ResponseEntity<Any> = restExceptionHandler.handleBadRequestException(ex)
        val exceptionDto: ExceptionDto? = handleBadRequestException.body as ExceptionDto?
        // Then
        assertNotNull(exceptionDto)
        assertEquals(HttpStatus.BAD_REQUEST, handleBadRequestException.statusCode)
        assertEquals(HttpStatus.BAD_REQUEST.value(), exceptionDto!!.statusCode)
        assertEquals(OmaErrorMessageType.BASIC_INVALID_INPUT.messageId, exceptionDto.error!!.id)
        assertEquals(OmaErrorMessageType.BASIC_INVALID_INPUT.text, exceptionDto.error!!.text)
        assertEquals(1, exceptionDto.variables.size)
        val message: Optional<String?> = Arrays.stream(exceptionDto.variables).findFirst()
        assertTrue(message.isPresent)
        assertEquals(ex.message, message.get())
    }

    @Test
    fun givenExceptionWhenHandleUnAuthorizedThenAssertResult() {
        // Given
        val ex: RuntimeException = AccessDeniedException("lorem")
        // When
        val handleBadRequestException: ResponseEntity<Any> = restExceptionHandler.handleUnAuthorized(ex)
        val exceptionDto: ExceptionDto? = handleBadRequestException.body as ExceptionDto?
        // Then
        assertNotNull(exceptionDto)
        assertEquals(HttpStatus.UNAUTHORIZED, handleBadRequestException.statusCode)
        assertEquals(HttpStatus.UNAUTHORIZED.value(), exceptionDto!!.statusCode)
        assertEquals(OmaErrorMessageType.UNAUTHORIZED.messageId, exceptionDto.error!!.id)
        assertEquals(OmaErrorMessageType.UNAUTHORIZED.text, exceptionDto.error!!.text)
        assertEquals(1, exceptionDto.variables.size)
        val message: Optional<String?> = Arrays.stream(exceptionDto.variables).findFirst()
        assertTrue(message.isPresent)
        assertEquals(ex.message, message.get())
    }

    @Test
    fun givenExceptionWhenHandleServerExceptionThenAssertResult() {
        // Given
        val errrMsg = "lorem"
        val ex = ServerException(OmaErrorMessageType.NOT_FOUND, arrayOf(errrMsg), HttpStatus.CONFLICT)
        // When
        val handleBadRequestException: ResponseEntity<Any> = restExceptionHandler.handleServerException(ex)
        val exceptionDto: ExceptionDto? = handleBadRequestException.body as ExceptionDto?
        // Then
        assertNotNull(exceptionDto)
        assertEquals(HttpStatus.CONFLICT, handleBadRequestException.statusCode)
        assertEquals(HttpStatus.CONFLICT.value(), exceptionDto!!.statusCode)
        assertEquals(OmaErrorMessageType.NOT_FOUND.messageId, exceptionDto.error!!.id)
        assertEquals(OmaErrorMessageType.NOT_FOUND.text, exceptionDto.error!!.text)
        assertEquals(1, exceptionDto.variables.size)
        val message: Optional<String?> = Arrays.stream(exceptionDto.variables).findFirst()
        assertTrue(message.isPresent)
        assertEquals(errrMsg, message.get())
    }

    @Test
    fun givenExceptionWhenHandleGeneralExceptionThenAssertResult() {
        // Given
        val ex = Exception("lorem")
        // When
        val handleBadRequestException: ResponseEntity<Any> = restExceptionHandler.handleGeneralException(ex)
        val exceptionDto: ExceptionDto? = handleBadRequestException.body as ExceptionDto?
        // Then
        assertNotNull(exceptionDto)
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, handleBadRequestException.statusCode)
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), exceptionDto!!.statusCode)
        assertEquals(OmaErrorMessageType.GENERIC_SERVICE_ERROR.messageId, exceptionDto.error!!.id)
        assertEquals(OmaErrorMessageType.GENERIC_SERVICE_ERROR.text, exceptionDto.error!!.text)
        assertEquals(1, exceptionDto.variables.size)
        val message: Optional<String?> = Arrays.stream(exceptionDto.variables).findFirst()
        assertTrue(message.isPresent)
        assertEquals(ex.message, message.get())
    }

    @Test
    fun givenExceptionWhenHandleHttpRequestMethodNotSupportedThenAssertResult() {
        // Given
        val ex = HttpRequestMethodNotSupportedException("lorem")
        // When
        val handleBadRequestException: ResponseEntity<Any> =
            restExceptionHandler.handleHttpRequestMethodNotSupported(ex)
        val exceptionDto: ExceptionDto? = handleBadRequestException.body as ExceptionDto?
        // Then
        assertNotNull(exceptionDto)
        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, handleBadRequestException.statusCode)
        assertEquals(HttpStatus.METHOD_NOT_ALLOWED.value(), exceptionDto!!.statusCode)
        assertEquals(OmaErrorMessageType.EXTRA_INPUT_NOT_ALLOWED.messageId, exceptionDto.error!!.id)
        assertEquals(OmaErrorMessageType.EXTRA_INPUT_NOT_ALLOWED.text, exceptionDto.error!!.text)
        assertEquals(1, exceptionDto.variables.size)
        val message: Optional<String?> = Arrays.stream(exceptionDto.variables).findFirst()
        assertTrue(message.isPresent)
        assertEquals(ex.message, message.get())
    }

    @Test
    fun givenExceptionWhenHandleHttpMediaTypeNotSupportedThenAssertResult() {
        // Given
        val ex = HttpMediaTypeNotSupportedException("lorem")
        // When
        val handleBadRequestException: ResponseEntity<Any> =
            restExceptionHandler.handleHttpMediaTypeNotSupported(ex)
        val exceptionDto: ExceptionDto? = handleBadRequestException.body as ExceptionDto?
        // Then
        assertNotNull(exceptionDto)
        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE, handleBadRequestException.statusCode)
        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value(), exceptionDto!!.statusCode)
        assertEquals(OmaErrorMessageType.BASIC_INVALID_INPUT.messageId, exceptionDto.error!!.id)
        assertEquals(OmaErrorMessageType.BASIC_INVALID_INPUT.text, exceptionDto.error!!.text)
        assertEquals(1, exceptionDto.variables.size)
        val message: Optional<String?> = Arrays.stream(exceptionDto.variables).findFirst()
        assertTrue(message.isPresent)
        assertEquals(ex.message, message.get())
    }

    @Test
    fun givenExceptionWhenHandleNoHandlerFoundExceptionThenAssertResult() {
        // Given
        val ex = NoHandlerFoundException("GET", "", HttpHeaders())
        // When
        val handleBadRequestException: ResponseEntity<Any> =
            restExceptionHandler.handleNoHandlerFoundException(ex)
        val exceptionDto: ExceptionDto? = handleBadRequestException.body as ExceptionDto?
        // Then
        assertNotNull(exceptionDto)
        assertEquals(HttpStatus.NOT_FOUND, handleBadRequestException.statusCode)
        assertEquals(HttpStatus.NOT_FOUND.value(), exceptionDto!!.statusCode)
        assertEquals(OmaErrorMessageType.NOT_FOUND.messageId, exceptionDto.error!!.id)
        assertEquals(OmaErrorMessageType.NOT_FOUND.text, exceptionDto.error!!.text)
        assertEquals(1, exceptionDto.variables.size)
        val message: Optional<String?> = Arrays.stream(exceptionDto.variables).findFirst()
        assertTrue(message.isPresent)
        assertEquals("No endpoint GET .", message.get())
    }
}
