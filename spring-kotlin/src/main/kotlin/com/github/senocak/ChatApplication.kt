package com.github.senocak

import com.github.senocak.domain.Friend
import com.github.senocak.domain.Message
import com.github.senocak.domain.Role
import com.github.senocak.domain.User
import com.github.senocak.repository.FriendRepository
import com.github.senocak.repository.MessageRepository
import com.github.senocak.repository.RoleRepository
import com.github.senocak.repository.UserRepository
import com.github.senocak.util.FriendShipStatus
import com.github.senocak.util.RoleName
import java.util.Date
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.boot.runApplication
import org.springframework.context.event.EventListener
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.annotation.Transactional

@SpringBootApplication
class ChatApplication(
    private val roleRepository: RoleRepository,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val messageRepository: MessageRepository,
    private val friendRepository: FriendRepository,
){
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    @Value("\${spring.jpa.hibernate.ddl-auto}")
    lateinit var ddl: String

    @Transactional
    @EventListener(value = [ApplicationReadyEvent::class])
    fun init(event: ApplicationReadyEvent): Unit =
        log.debug("[ApplicationReadyEvent]: ${event.timeTaken.toSeconds()}").also {
            if (ddl == "create" || ddl == "create-drop") {
                roleRepository.deleteAll()
                userRepository.deleteAll()
                messageRepository.deleteAll()
                val userRole: Role = roleRepository.save(Role(name = RoleName.ROLE_USER))
                val adminRole: Role = roleRepository.save(Role(name = RoleName.ROLE_ADMIN))
                val defaultPass: String = passwordEncoder.encode("asenocak")
                val user1: User = userRepository.save(User(name = "Anıl Şenocak1", username = "anilsenocak1", email = "anil1@senocak.com", password = defaultPass, roles = arrayListOf(userRole, adminRole)))
                val user2: User = userRepository.save(User(name = "Anıl Şenocak2", username = "anilsenocak2", email = "anil2@senocak.com", password = defaultPass, roles = arrayListOf(userRole)))
                val user3: User = userRepository.save(User(name = "Anıl Şenocak3", username = "anilsenocak3", email = "anil3@senocak.com", password = defaultPass, roles = arrayListOf(adminRole)))
                val msg1: Message = messageRepository.save(Message(from = user1, to = user2, text = "from = anil1, to = anil2"))
                val msg2: Message = messageRepository.save(Message(from = user2, to = user1, text = "from = anil2, to = anil1", readAt = Date()))
                val msg3: Message = messageRepository.save(Message(from = user2, to = user3, text = "from = anil2, to = anil3 first"))
                val msg4: Message = messageRepository.save(Message(from = user2, to = user3, text = "from = anil2, to = anil3 second", readAt = Date()))
                val friendShipRequest1: Friend = friendRepository.save(Friend(owner = user1, person = user2, status = FriendShipStatus.Pending))
                val friendShipRequest2: Friend = friendRepository.save(Friend(owner = user1, person = user3, status = FriendShipStatus.Accepted))
                val friendShipRequest3: Friend = friendRepository.save(Friend(owner = user2, person = user3, status = FriendShipStatus.Pending, blockedBy = user2))
                log.debug("[ApplicationReadyEvent]: db migrated.")
            }
        }
}

fun main(args: Array<String>) {
    runApplication<ChatApplication>(*args)
}
