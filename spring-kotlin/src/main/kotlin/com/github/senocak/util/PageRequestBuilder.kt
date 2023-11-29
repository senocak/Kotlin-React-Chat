package com.github.senocak.util

import com.github.senocak.domain.dto.PaginationCriteria
import com.github.senocak.exception.ServerException
import org.springframework.data.domain.PageRequest
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus

object PageRequestBuilder {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    fun build(paginationCriteria: PaginationCriteria): PageRequest {
        if (paginationCriteria.page < 1) {
            "Page must be greater than 0!"
                .also { log.warn(it) }
                .run { throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                    variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST) }
        }
        paginationCriteria.page -= 1
        if (paginationCriteria.size < 1) {
            "Size must be greater than 0!"
                .also { log.warn(it) }
                .run { throw ServerException(omaErrorMessageType = OmaErrorMessageType.BASIC_INVALID_INPUT,
                    variables = arrayOf(this), statusCode = HttpStatus.BAD_REQUEST) }
        }
        val pageRequest: PageRequest = PageRequest.of(paginationCriteria.page, paginationCriteria.size)
        if (paginationCriteria.sortBy != null && paginationCriteria.sort != null) {
            val direction: Sort.Direction = when (paginationCriteria.sort) {
                "desc" -> Sort.Direction.DESC
                else -> Sort.Direction.ASC
            }
            if (paginationCriteria.columns.contains(element = paginationCriteria.sortBy))
                return pageRequest.withSort(Sort.by(direction, paginationCriteria.sortBy))
        }
        return pageRequest
    }
}