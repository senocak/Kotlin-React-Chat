package com.github.senocak.service

import com.github.senocak.domain.Friend
import com.github.senocak.domain.User
import com.github.senocak.repository.FriendRepository
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.CriteriaQuery
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service

@Service
class FriendService(
    private val friendRepository: FriendRepository
) {
    fun save(friend: Friend): Friend = friendRepository.save(friend)

    fun delete(friend: Friend): Unit = friendRepository.delete(friend)

    fun findAll(specification: Specification<Friend>, pageRequest: Pageable): Page<Friend> =
        friendRepository.findAll(specification, pageRequest)

    fun findAll(specification: Specification<Friend>): MutableList<Friend> =
        friendRepository.findAll(specification)

    fun createSpecification(owner: User): Specification<Friend> {
        return Specification { root: Root<Friend>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder ->
            val predicates: MutableList<Predicate> = ArrayList()

            predicates.add(
                criteriaBuilder.or(
                    criteriaBuilder.and(
                        criteriaBuilder.equal(root.get<User>("owner"), owner),
                    ),
                    criteriaBuilder.and(
                        criteriaBuilder.equal(root.get<User>("person"), owner)
                    )
                )
            )
            query.where(*predicates.toTypedArray()).distinct(true).restriction
        }
    }
}
