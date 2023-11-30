package com.github.senocak.service

import com.github.senocak.TestConstants
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.function.Executable
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import java.nio.file.AccessDeniedException
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.mockito.InjectMocks
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock

@Tag("unit")
@ExtendWith(MockitoExtension::class)
@DisplayName("Unit Tests for AuthenticationService")
class AuthenticationServiceTest {
    @InjectMocks private lateinit var authenticationService: AuthenticationService
    private val auth: Authentication = mock<Authentication>()
    private var user: User? = null

    @BeforeEach
    fun initSecurityContext() {
        SecurityContextHolder.getContext().authentication = auth
    }

    @Test
    fun givenNullAuthenticationWhenIsAuthorizedThenThrowAccessDeniedException() {
        // When
        val closureToTest = Executable { authenticationService.isAuthorized(aInRoles = arrayOf()) }
        // Then
        Assertions.assertThrows(AccessDeniedException::class.java, closureToTest)
    }

    @Test
    @Throws(AccessDeniedException::class)
    fun givenWhenIsAuthorizedThenAssertResult() {
        // Given
        val authorities: MutableList<GrantedAuthority> = ArrayList()
        authorities.add(element = SimpleGrantedAuthority("ROLE_ADMIN"))
        user = User(TestConstants.USER_EMAIL, TestConstants.USER_PASSWORD, authorities)
        doReturn(value = user).`when`(auth).principal
        // When
        val preHandle: Boolean = authenticationService.isAuthorized(aInRoles = arrayOf("ADMIN"))
        // Then
        assertTrue(preHandle)
    }

    @Test
    @Throws(AccessDeniedException::class)
    fun givenNotValidRoleWhenIsAuthorizedThenAssertResult() {
        // Given
        val authorities: MutableList<GrantedAuthority> = ArrayList()
        authorities.add(element = SimpleGrantedAuthority("ROLE_ADMIN"))
        user = User(TestConstants.USER_EMAIL, TestConstants.USER_PASSWORD, authorities)
        doReturn(value = user).`when`(auth).principal
        // When
        val preHandle: Boolean = authenticationService.isAuthorized(aInRoles = arrayOf("USER"))
        // Then
        assertFalse(preHandle)
    }
}
