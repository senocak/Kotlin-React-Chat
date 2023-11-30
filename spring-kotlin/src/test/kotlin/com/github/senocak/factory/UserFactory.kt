package com.github.senocak.factory

import com.github.senocak.TestConstants.USER_EMAIL
import com.github.senocak.TestConstants.USER_NAME
import com.github.senocak.TestConstants.USER_PASSWORD
import com.github.senocak.domain.Role
import com.github.senocak.domain.User
import com.github.senocak.util.RoleName

object UserFactory {

    /**
     * Creates a new user with the given name, username, email, password and roles.
     * @return the new user
     */
    fun createUser(): User =
        User(name = USER_NAME, email = USER_EMAIL, password = USER_PASSWORD,
            roles = listOf(createRole(RoleName.ROLE_USER), createRole(RoleName.ROLE_ADMIN)))

    /**
     * Creates a new role with the given name.
     * @param roleName the name of the role
     * @return the new role
     */
    private fun createRole(roleName: RoleName?): Role = Role(name = roleName)
}
