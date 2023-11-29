package com.github.senocak.exception

import com.fasterxml.jackson.module.kotlin.MissingKotlinParameterException
import com.github.senocak.domain.dto.ExceptionDto
import com.github.senocak.util.OmaErrorMessageType
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.TypeMismatchException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.HttpMediaTypeNotSupportedException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MissingPathVariableException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.servlet.NoHandlerFoundException
import java.lang.reflect.UndeclaredThrowableException
import java.security.InvalidParameterException
import jakarta.validation.ConstraintViolationException

@RestControllerAdvice
class RestExceptionHandler {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    @ExceptionHandler(
        BadCredentialsException::class,
        ConstraintViolationException::class,
        InvalidParameterException::class,
        TypeMismatchException::class,
        MissingPathVariableException::class,
        HttpMessageNotReadableException::class,
        MissingServletRequestParameterException::class,
        MissingKotlinParameterException::class,
        UndeclaredThrowableException::class
    )
    fun handleBadRequestException(ex: Exception): ResponseEntity<Any> =
        generateResponseEntity(httpStatus = HttpStatus.BAD_REQUEST, variables = arrayOf(ex.message),
            omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT)

    @ExceptionHandler(
        AccessDeniedException::class,
        AuthenticationCredentialsNotFoundException::class,
        com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException::class
    )
    fun handleUnAuthorized(ex: Exception): ResponseEntity<Any> =
        generateResponseEntity(httpStatus = HttpStatus.UNAUTHORIZED, variables = arrayOf(ex.message),
            omaErrorMessageType = OmaErrorMessageType.UNAUTHORIZED)

    @ExceptionHandler(HttpRequestMethodNotSupportedException::class)
    fun handleHttpRequestMethodNotSupported(ex: HttpRequestMethodNotSupportedException): ResponseEntity<Any> =
        generateResponseEntity(httpStatus = HttpStatus.METHOD_NOT_ALLOWED, variables = arrayOf(ex.message),
            omaErrorMessageType = OmaErrorMessageType.EXTRA_INPUT_NOT_ALLOWED)

    @ExceptionHandler(HttpMediaTypeNotSupportedException::class)
    fun handleHttpMediaTypeNotSupported(ex: HttpMediaTypeNotSupportedException): ResponseEntity<Any> =
        generateResponseEntity(httpStatus = HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT, variables = arrayOf(ex.message))

    @ExceptionHandler(NoHandlerFoundException::class, UsernameNotFoundException::class)
    fun handleNoHandlerFoundException(ex: Exception): ResponseEntity<Any> =
        generateResponseEntity(httpStatus = HttpStatus.NOT_FOUND,
            omaErrorMessageType = OmaErrorMessageType.NOT_FOUND, variables = arrayOf(ex.message))

    @ExceptionHandler(ServerException::class)
    fun handleServerException(ex: ServerException): ResponseEntity<Any> =
        generateResponseEntity(httpStatus = ex.statusCode, omaErrorMessageType = ex.omaErrorMessageType,
            variables = ex.variables)

    @ExceptionHandler(Exception::class)
    fun handleGeneralException(ex: Exception): ResponseEntity<Any> =
        generateResponseEntity(httpStatus = HttpStatus.INTERNAL_SERVER_ERROR, variables = arrayOf(ex.message),
            omaErrorMessageType = OmaErrorMessageType.GENERIC_SERVICE_ERROR)

    /**
     * @param httpStatus -- returned code
     * @return -- returned body
     */
    private fun generateResponseEntity(httpStatus: HttpStatus, omaErrorMessageType: OmaErrorMessageType,
                                       variables: Array<String?>): ResponseEntity<Any> =
        ExceptionDto()
            .also {
                it.statusCode = httpStatus.value()
                it.error = ExceptionDto.OmaErrorMessageTypeDto(
                    id = omaErrorMessageType.messageId,
                    text = omaErrorMessageType.text
                )
                it.variables = variables
            }
            .run {
                log.error("Exception is handled. HttpStatus: $httpStatus, OmaErrorMessageType: $omaErrorMessageType, variables: ${variables.toList()}")
                ResponseEntity.status(httpStatus).body(this)
            }
}
