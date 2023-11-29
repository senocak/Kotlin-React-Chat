package com.github.senocak.service

import com.github.senocak.domain.Role
import com.github.senocak.repository.RoleRepository
import com.github.senocak.util.RoleName
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.mockito.junit.jupiter.MockitoExtension
import java.util.Optional

@Tag("unit")
@ExtendWith(MockitoExtension::class)
@DisplayName("Unit Tests for RoleService")
class RoleServiceTest {
    private val roleRepository = Mockito.mock(RoleRepository::class.java)
    private var roleService = RoleService(roleRepository)

    @Test
    fun givenRoleName_whenFindByName_thenAssertResult() {
        // Given
        val role = Role()
        val roleName: RoleName = RoleName.ROLE_USER
        Mockito.doReturn(Optional.of<Any>(role)).`when`(roleRepository).findByName(roleName)
        // When
        val findByName: Role? = roleService.findByName(roleName)
        // Then
        Assertions.assertEquals(role, findByName)
    }

    @Test
    fun givenNullRoleName_whenFindByName_thenAssertResult() {
        // Given
        val roleName: RoleName = RoleName.ROLE_USER
        // When
        val findByName: Role? = roleService.findByName(roleName)
        // Then
        Assertions.assertNull(findByName)
    }
}
