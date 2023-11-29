package com.github.senocak.service

import com.github.senocak.domain.Role
import com.github.senocak.repository.RoleRepository
import com.github.senocak.util.RoleName
import org.springframework.stereotype.Service

@Service
class RoleService(private val roleRepository: RoleRepository) {

    /**
     * @param roleName -- enum variable to retrieve from db
     * @return -- Role object retrieved from db
     */
    fun findByName(roleName: RoleName): Role? = roleRepository.findByName(roleName = roleName)
}