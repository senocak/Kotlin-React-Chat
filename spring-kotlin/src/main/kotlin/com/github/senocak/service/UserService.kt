package com.github.senocak.service

import com.github.senocak.domain.Message
import com.github.senocak.domain.User
import com.github.senocak.repository.MessageRepository
import com.github.senocak.repository.UserRepository
import com.github.senocak.util.RoleName
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.CriteriaQuery
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import java.util.UUID
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
    private val userRepository: UserRepository,
    private val messageRepository: MessageRepository
): UserDetailsService {

    /**
     * @param id -- uuid id to find in db
     * @return -- Optional User object
     */
    fun findById(id: UUID): User =
        userRepository.findById(id).orElseThrow { UsernameNotFoundException("User not found with id") }

    /**
     * @param username -- string username to find in db
     * @return -- Optional User object
     */
    fun findByUsername(username: String): User =
        userRepository.findByUsername(username = username) ?: throw UsernameNotFoundException("User not found with email")

    /**
     * @param username -- string username to find in db
     * @return -- Optional User object
     */
    fun existsByUsername(username: String): Boolean = userRepository.existsByUsername(username = username)

    /**
     * @param email -- string email to find in db
     * @return -- true or false
     */
    fun existsByEmail(email: String): Boolean = userRepository.existsByEmail(email = email)

    /**
     * @param email -- string email to find in db
     * @return -- User object
     * @throws UsernameNotFoundException -- throws UsernameNotFoundException
     */
    @Throws(UsernameNotFoundException::class)
    fun findByEmail(email: String): User =
        userRepository.findByEmail(email = email) ?: throw UsernameNotFoundException("User not found with email: $email")

    /**
     * @param user -- User object to persist to db
     * @return -- User object that is persisted to db
     */
    fun save(user: User): User = userRepository.save(user)

    /**
     * @param username -- username
     * @return -- Spring User object
     */
    @Transactional
    @Throws(UsernameNotFoundException::class)
    override fun loadUserByUsername(username: String): org.springframework.security.core.userdetails.User {
        val user: User = findByUsername(username = username)
        val authorities: List<GrantedAuthority> = user.roles.stream()
            .map { SimpleGrantedAuthority(RoleName.fromString(r = it.name.toString())!!.name) }
            .toList()
        return org.springframework.security.core.userdetails.User(user.username, user.password, authorities)
    }

    /**
     * @return -- User entity that is retrieved from context
     */
    val loggedInUser: User
        get() =
            (SecurityContextHolder.getContext().authentication.principal as org.springframework.security.core.userdetails.User).username
                .run { findByUsername(username = this)  }

    //fun findMessagesBetweenUsers(q: String? = null, from: User, to: User, page: Pageable): Page<Message> =
    //    messageRepository.findMessagesBetweenUsers(user1 = from, user2 = to, page = page)

    fun findAll(specification: Specification<Message>, pageRequest: Pageable): Page<Message> =
        messageRepository.findAll(specification, pageRequest)

    fun createSpecification(user1: User, user2: User, body: String?): Specification<Message> {
        return Specification { root: Root<Message>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder ->
            val predicates: MutableList<Predicate> = ArrayList()

            if (body != null && body != "")
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("body")), "%${body.lowercase()}%"))

            predicates.add(
                criteriaBuilder.or(
                    criteriaBuilder.and(
                        criteriaBuilder.equal(root.get<User>("from"), user1),
                        criteriaBuilder.equal(root.get<User>("to"), user2)
                    ),
                    criteriaBuilder.and(
                        criteriaBuilder.equal(root.get<User>("from"), user2),
                        criteriaBuilder.equal(root.get<User>("to"), user1)
                    )
                )
            )
            query.where(*predicates.toTypedArray()).distinct(true).restriction
        }
    }
}
