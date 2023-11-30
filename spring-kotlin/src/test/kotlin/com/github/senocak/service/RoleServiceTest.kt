package com.github.senocak.service

import com.github.senocak.domain.Role
import com.github.senocak.repository.RoleRepository
import com.github.senocak.util.RoleName
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.junit.jupiter.MockitoExtension
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.mockito.InjectMocks
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock

@Tag("unit")
@ExtendWith(MockitoExtension::class)
@DisplayName("Unit Tests for RoleService")
class RoleServiceTest {
    @InjectMocks private lateinit var roleService: RoleService
    private val roleRepository: RoleRepository = mock<RoleRepository>()

    @Test
    fun givenRoleName_whenFindByName_thenAssertResult() {
        // Given
        val role = Role()
        val roleName: RoleName = RoleName.ROLE_USER
        doReturn(value = role).`when`(roleRepository).findByName(roleName = roleName)
        // When
        val findByName: Role? = roleService.findByName(roleName = roleName)
        // Then
        assertEquals(role, findByName)
    }

    @Test
    fun givenNullRoleName_whenFindByName_thenAssertResult() {
        // Given
        val roleName: RoleName = RoleName.ROLE_USER
        // When
        val findByName: Role? = roleService.findByName(roleName = roleName)
        // Then
        assertNull(findByName)
    }
}
