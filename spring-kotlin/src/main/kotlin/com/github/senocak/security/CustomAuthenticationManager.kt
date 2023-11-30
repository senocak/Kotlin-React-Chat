package com.github.senocak.security

import com.github.senocak.domain.Role
import com.github.senocak.domain.User
import com.github.senocak.service.UserService
import com.github.senocak.util.RoleName
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class CustomAuthenticationManager(
    private val userService: UserService,
    private val passwordEncoder: PasswordEncoder
): AuthenticationManager {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    @Transactional
    override fun authenticate(authentication: Authentication): Authentication {
        val user: User = userService.findByEmail(email = authentication.name)
        if (authentication.credentials != null){
            val matches: Boolean = passwordEncoder.matches(authentication.credentials.toString(), user.password)
            when {
                !matches -> {
                    "Email or password invalid: Email ${user.name}"
                        .also { log.error(it) }
                        .run { throw AuthenticationCredentialsNotFoundException(this) }
                }
            }
        }
        val authorities: MutableCollection<SimpleGrantedAuthority> = ArrayList()
        authorities.add(SimpleGrantedAuthority(RoleName.ROLE_USER.role))
        if (user.roles.any { r: Role -> r.name!! == RoleName.ROLE_ADMIN })
            authorities.add(SimpleGrantedAuthority(RoleName.ROLE_ADMIN.role))

        val loadUserByEmail: org.springframework.security.core.userdetails.User = userService.loadUserByUsername(email = authentication.name)
        val auth: Authentication = UsernamePasswordAuthenticationToken(loadUserByEmail, user.password, authorities)
        SecurityContextHolder.getContext().authentication = auth
        log.debug("Authentication is set to SecurityContext for ${user.name}")
        return auth
    }
}