package com.github.senocak.service

import com.github.senocak.domain.User
import com.github.senocak.factory.UserFactory.createUser
import com.github.senocak.repository.MessageRepository
import com.github.senocak.repository.UserRepository
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.function.Executable
import org.mockito.Mockito
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UsernameNotFoundException
import java.util.Optional

@Tag("unit")
@ExtendWith(MockitoExtension::class)
@DisplayName("Unit Tests for UserService")
class UserServiceTest {
    private val userRepository = Mockito.mock(UserRepository::class.java)
    private val messageRepository = Mockito.mock(MessageRepository::class.java)
    private var userService = UserService(userRepository, messageRepository)
    private var auth = Mockito.mock(Authentication::class.java)
    private var user = Mockito.mock(org.springframework.security.core.userdetails.User::class.java)

    @Test
    fun givenUsername_whenExistsByEmail_thenAssertResult() {
        // When
        val existsByEmail = userService.existsByEmail("username")
        // Then
        Assertions.assertFalse(existsByEmail)
    }

    @Test
    fun givenEmail_whenFindByUsername_thenAssertResult() {
        // Given
        val user: User = createUser()
        Mockito.doReturn(Optional.of<Any>(user)).`when`(userRepository).findByEmail("Email")
        // When
        val findByEmail: User? = userService.findByEmail("Email")
        // Then
        Assertions.assertEquals(user, findByEmail)
    }

    @Test
    fun givenNullEmail_whenFindByEmail_thenAssertResult() {
        // When
        val closureToTest = Executable { userService.findByEmail("Email") }
        // Then
        Assertions.assertThrows(UsernameNotFoundException::class.java, closureToTest)
    }

    @Test
    fun givenUser_whenSave_thenAssertResult() {
        // Given
        val user: User = createUser()
        Mockito.doReturn(user).`when`(userRepository).save<User>(user)
        // When
        val save: User = userService.save(user)
        // Then
        Assertions.assertEquals(user, save)
    }

    @Test
    fun givenUser_whenCreate_thenAssertResult() {
        // Given
        val user: User = createUser()
        Mockito.`when`(userRepository.save(user)).thenReturn(user)
        // When
        val create: User = userService.save(user)
        // Then
        Assertions.assertEquals(user, create)
    }

    @Test
    fun givenNullUsername_whenLoadUserByUsername_thenAssertResult() {
        // When
        val closureToTest = Executable { userService.loadUserByUsername("username") }
        // Then
        Assertions.assertThrows(UsernameNotFoundException::class.java, closureToTest)
    }

    @Test
    fun givenUsername_whenLoadUserByUsername_thenAssertResult() {
        // Given
        val user: User = createUser()
        Mockito.doReturn(Optional.of<Any>(user)).`when`(userRepository).findByUsername("username")
        // When
        val loadUserByUsername = userService.loadUserByUsername("username")
        // Then
        Assertions.assertEquals(user.email, loadUserByUsername.username)
    }

    @Test
    fun givenNotLoggedIn_whenLoadUserByUsername_thenAssertResult() {
        // Given
        SecurityContextHolder.getContext().authentication = auth
        Mockito.doReturn(user).`when`(auth).principal
        Mockito.doReturn("user").`when`(user).username
        // When
        val closureToTest = Executable { userService.loggedInUser }
        // Then
        Assertions.assertThrows(UsernameNotFoundException::class.java, closureToTest)
    }

    @Test
    @Throws(UsernameNotFoundException::class)
    fun givenLoggedIn_whenLoadUserByUsername_thenAssertResult() {
        // Given
        SecurityContextHolder.getContext().authentication = auth
        Mockito.doReturn(user).`when`(auth).principal
        Mockito.doReturn("username").`when`(user).username
        val user: User = createUser()
        Mockito.doReturn(Optional.of<Any>(user)).`when`(userRepository).findByUsername("username")
        // When
        val loggedInUser: User = userService.loggedInUser
        // Then
        Assertions.assertEquals(user.email, loggedInUser.email)
    }
}