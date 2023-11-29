package com.github.senocak.service

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import org.springframework.stereotype.Service
import java.nio.file.AccessDeniedException
import java.util.Objects
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority

@Service
class AuthenticationService {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)
    var authorizationFailed = "Authentication error"

    /**
     * Getting username from the security context
     * @param aInRoles -- roles that user must have
     * @return  -- username or null
     * @throws AccessDeniedException -- if user does not have required roles
     */
    @Throws(AccessDeniedException::class)
    fun isAuthorized(aInRoles: Array<String>): Boolean {
        val getPrinciple: User = getPrinciple()
            ?: throw AccessDeniedException(authorizationFailed)
                .also { log.warn("AccessDeniedException occurred") }
        try {
            for (role: String in aInRoles) {
                for (authority: GrantedAuthority in getPrinciple.authorities) {
                    if (authority.authority == "ROLE_$role")
                        return true
                }
            }
        } catch (e: Exception) {
            throw AccessDeniedException(authorizationFailed)
        }
        return false
    }

    /**
     * Getting user object that is in the security context
     * @return -- user object or null
     */
    fun getPrinciple(): User? =
        try {
            val authentication: Authentication = SecurityContextHolder.getContext().authentication
            if (authentication.principal is User) {
                authentication.principal as User
            } else null
        } catch (e: Exception) {
            log.warn("Exception occurred, returning null")
            null
        }
}