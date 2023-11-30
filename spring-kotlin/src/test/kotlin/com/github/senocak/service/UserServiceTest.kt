package com.github.senocak.service

import com.github.senocak.domain.User
import com.github.senocak.factory.UserFactory.createUser
import com.github.senocak.repository.MessageRepository
import com.github.senocak.repository.UserRepository
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.function.Executable
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.mockito.InjectMocks
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.security.core.userdetails.User as SecureUser

@Tag("unit")
@ExtendWith(MockitoExtension::class)
@DisplayName("Unit Tests for UserService")
class UserServiceTest {
    @InjectMocks private lateinit var userService: UserService

    private val userRepository: UserRepository = mock<UserRepository>()
    private val messageRepository: MessageRepository = mock<MessageRepository>()
    private var auth: Authentication = mock<Authentication>()
    private var secureUser: SecureUser = mock<SecureUser>()

    @Test
    fun givenUsername_whenExistsByEmail_thenAssertResult() {
        // When
        userService.existsByEmail(email = "username")
            .run {
                // Then
                assertFalse(this)
            }
    }

    @Test
    fun givenEmail_whenFindByUsername_thenAssertResult() {
        // Given
        val user: User = createUser()
            .also {
                doReturn(value = it).`when`(userRepository).findByEmail(email = "Email")
            }
        // When
        userService.findByEmail(email = "Email")
            .run {
                // Then
                assertEquals(user, this)
            }
    }

    @Test
    fun givenNullEmail_whenFindByEmail_thenAssertResult() {
        // When
        val closureToTest = Executable { userService.findByEmail(email = "Email") }
        // Then
        assertThrows(UsernameNotFoundException::class.java, closureToTest)
    }

    @Test
    fun givenUser_whenSave_thenAssertResult() {
        // Given
        val user: User = createUser()
            .also {
                doReturn(value = it).`when`(userRepository).save<User>(it)
            }
        // When
        val save: User = userService.save(user)
        // Then
        assertEquals(user, save)
    }

    @Test
    fun givenUser_whenCreate_thenAssertResult() {
        // Given
        val user: User = createUser()
            .also {
                whenever(methodCall = userRepository.save(it)).thenReturn(it)
            }
        // When
        val create: User = userService.save(user)
        // Then
        assertEquals(user, create)
    }

    @Test
    fun givenNullUsername_whenLoadUserByUsername_thenAssertResult() {
        // When
        val closureToTest = Executable { userService.loadUserByUsername(email = "username") }
        // Then
        assertThrows(UsernameNotFoundException::class.java, closureToTest)
    }

    @Test
    fun givenUsername_whenLoadUserByUsername_thenAssertResult() {
        // Given
        val user: User = createUser()
            .also {
                doReturn(value = it).`when`(userRepository).findByEmail(email = "username")
            }
        // When
        userService.findByEmail("username")
            .run {
                // Then
                assertEquals(user.email, this.email)
            }
    }

    @Test
    fun givenNotLoggedIn_whenLoadUserByUsername_thenAssertResult() {
        // Given
        SecurityContextHolder.getContext().authentication = auth
        doReturn(value = secureUser).`when`(auth).principal
        doReturn(value = "user").`when`(secureUser).username
        // When
        val closureToTest = Executable { userService.loggedInUser }
        // Then
        assertThrows(UsernameNotFoundException::class.java, closureToTest)
    }

    @Test
    @Throws(UsernameNotFoundException::class)
    fun givenLoggedIn_whenLoadUserByUsername_thenAssertResult() {
        // Given
        SecurityContextHolder.getContext().authentication = auth
        doReturn(value = secureUser).`when`(auth).principal
        doReturn(value = "username").`when`(secureUser).username
        val user: User = createUser()
        doReturn(value = user).`when`(userRepository).findByEmail(email = "username")
        // When
        userService.loggedInUser
            .run {
                // Then
                assertEquals(user.email, this.email)
            }
    }
}