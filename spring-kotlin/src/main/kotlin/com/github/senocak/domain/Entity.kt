package com.github.senocak.domain

import com.github.senocak.util.FriendShipStatus
import com.github.senocak.util.RoleName
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.ForeignKey
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.Lob
import jakarta.persistence.ManyToMany
import jakarta.persistence.ManyToOne
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.io.Serializable
import java.util.Date
import java.util.UUID
import org.hibernate.annotations.DynamicUpdate

@MappedSuperclass
open class BaseDomain(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,
    @Column var createdAt: Date = Date(),
    @Column var updatedAt: Date = Date()
) : Serializable

@Entity
@Table(name = "users", uniqueConstraints = [
    UniqueConstraint(columnNames = ["username"]),
    UniqueConstraint(columnNames = ["email"])
])
@DynamicUpdate // TODO https://twitter.com/NiestrojRobert/status/1711280585111716218
class User(
    @Column var name: String,
    @Column var username: String,
    @Column var email: String,
    @Column var password: String?,

    @JoinTable(name = "user_roles",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "role_id")]
    )
    @ManyToMany(fetch = FetchType.EAGER)
    var roles: List<Role> = arrayListOf(),
) : BaseDomain()

@Entity
@Table(name = "roles")
class Role(@Column @Enumerated(EnumType.STRING) var name: RoleName? = null) : BaseDomain()

@Entity
@Table(
    name = "friends",
    uniqueConstraints = [UniqueConstraint(columnNames = ["owner_id", "person_id", "status"])]
)
class Friend(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "owner_id",
        referencedColumnName = "id",
        nullable = false,
        foreignKey = ForeignKey(name = "fk_friend_owner_user_id")
    )
    var owner: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "person_id",
        referencedColumnName = "id",
        nullable = false,
        foreignKey = ForeignKey(name = "fk_friend_person_user_id")
    )
    var person: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "block_id",
        referencedColumnName = "id",
        nullable = true,
        foreignKey = ForeignKey(name = "fk_friend_block_user_id")
    )
    var blockedBy: User? = null,

    @Column @Enumerated(EnumType.STRING) var status: FriendShipStatus,

    @Column var approvedAt: Date? = null,
    @Column var blockedAt: Date? = null
) : BaseDomain()

@Entity
@Table(name = "messages")
class Message(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "from_id",
        referencedColumnName = "id",
        nullable = false,
        foreignKey = ForeignKey(name = "fk_message_from_user_id")
    )
    var from: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "to_id",
        referencedColumnName = "id",
        nullable = false,
        foreignKey = ForeignKey(name = "fk_message_to_user_id")
    )
    var to: User,

    @Column(nullable = false) var text: String? = null,
    @Column @Lob var binary: String? = null,
    @Column var readAt: Date? = null
) : BaseDomain()