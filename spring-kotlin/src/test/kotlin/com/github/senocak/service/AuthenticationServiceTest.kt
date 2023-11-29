package com.github.senocak.service

import com.github.senocak.TestConstants
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.function.Executable
import org.mockito.Mockito
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import java.nio.file.AccessDeniedException

@Tag("unit")
@ExtendWith(MockitoExtension::class)
@DisplayName("Unit Tests for AuthenticationService")
class AuthenticationServiceTest {
    private val authenticationService = AuthenticationService()
    var auth: Authentication = Mockito.mock(Authentication::class.java)
    var user: User? = null

    @BeforeEach
    fun initSecurityContext() {
        SecurityContextHolder.getContext().authentication = auth
    }

    @Test
    fun givenNullAuthenticationWhenIsAuthorizedThenThrowAccessDeniedException() {
        // When
        val closureToTest = Executable { authenticationService.isAuthorized(arrayOf()) }
        // Then
        Assertions.assertThrows(AccessDeniedException::class.java, closureToTest)
    }

    @Test
    @Throws(AccessDeniedException::class)
    fun givenWhenIsAuthorizedThenAssertResult() {
        // Given
        val authorities: MutableList<GrantedAuthority> = ArrayList()
        authorities.add(SimpleGrantedAuthority("ROLE_ADMIN"))
        user = User(TestConstants.USER_USERNAME, TestConstants.USER_PASSWORD, authorities)
        Mockito.doReturn(user).`when`(auth).principal
        // When
        val preHandle: Boolean = authenticationService.isAuthorized(arrayOf("ADMIN"))
        // Then
        Assertions.assertTrue(preHandle)
    }

    @Test
    @Throws(AccessDeniedException::class)
    fun givenNotValidRoleWhenIsAuthorizedThenAssertResult() {
        // Given
        val authorities: MutableList<GrantedAuthority> = ArrayList()
        authorities.add(SimpleGrantedAuthority("ROLE_ADMIN"))
        user = User(TestConstants.USER_USERNAME, TestConstants.USER_PASSWORD, authorities)
        Mockito.doReturn(user).`when`(auth).principal
        // When
        val preHandle: Boolean = authenticationService.isAuthorized(arrayOf("USER"))
        // Then
        Assertions.assertFalse(preHandle)
    }
}
