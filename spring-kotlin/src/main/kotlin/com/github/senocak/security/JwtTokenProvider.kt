package com.github.senocak.security

import com.github.senocak.domain.dto.UserInfoCache
import io.jsonwebtoken.Claims
import io.jsonwebtoken.ExpiredJwtException
import io.jsonwebtoken.Jws
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.MalformedJwtException
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.SignatureException
import io.jsonwebtoken.UnsupportedJwtException
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import java.security.Key
import java.util.Date
import java.util.concurrent.TimeUnit
import net.jodah.expiringmap.ExpiringMap
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Component

@Component
class JwtTokenProvider(
    @Value("\${app.jwtSecret}") jSecret: String,
    @Value("\${app.jwtExpirationInMs}") jExpirationInMs: String,
    @Value("\${app.refreshExpirationInMs}") rExpirationInMs: String
) {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)
    private var jwtSecret: String = jSecret
    private var jwtExpirationInMs: String = jExpirationInMs
    private var refreshExpirationInMs: String = rExpirationInMs
    private var tokenEventMap: ExpiringMap<String, UserInfoCache> = ExpiringMap.builder().variableExpiration().build()

    /**
     * Generating the jwt token
     * @param email -- email
     */
    fun generateJwtToken(email: String, roles: List<String?>): String =
        generateToken(subject = email, roles = roles, expirationInMs = jwtExpirationInMs.toLong())
            .run {
                UserInfoCache(email = email, token = this, type = "jwt", expireTimeStamp = jwtExpirationInMs.toLong())
                    .also { userInfoCache: UserInfoCache ->
                        tokenEventMap.put(this, userInfoCache, jwtExpirationInMs.toLong(), TimeUnit.MILLISECONDS)
                    }
                this
            }

    /**
     * Generating the refresh token
     * @param email -- email
     */
    fun generateRefreshToken(email: String, roles: List<String?>): String =
        generateToken(subject = email, roles = roles, expirationInMs = refreshExpirationInMs.toLong())
            .run {
                UserInfoCache(email = email, token = this, type = "refresh", expireTimeStamp = refreshExpirationInMs.toLong())
                .also { userInfoCache: UserInfoCache ->
                    tokenEventMap.put(this, userInfoCache, refreshExpirationInMs.toLong(), TimeUnit.MILLISECONDS)
                }
                this
            }

    /**
     * Generating the token
     * @param subject -- email
     */
    private fun generateToken(subject: String, roles: List<String?>, expirationInMs: Long): String =
        HashMap<String, Any>()
            .also { it["roles"] = roles }
            .run {
                val now = Date()
                Jwts.builder()
                    .setClaims(this)
                    .setSubject(subject)
                    .setIssuedAt(now)
                    .setExpiration(Date(now.time + expirationInMs))
                    .signWith(signKey, SignatureAlgorithm.HS256)
                    .compact()
            }

    private val signKey: Key
        get() = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret))

    /**
     * Get the jws claims
     * @param token -- jwt token
     * @return -- expiration date
     */
    private fun getJwsClaims(token: String): Jws<Claims?> = Jwts.parserBuilder().setSigningKey(signKey).build().parseClaimsJws(token)

    /**
     * @param token -- jwt token
     * @return -- email from jwt
     */
    fun getEmailFromJWT(token: String): String = getJwsClaims(token = token).body!!.subject

    /**
     * @param token -- jwt token
     */
    fun validateToken(token: String): UserInfoCache {
        try {
            getJwsClaims(token = token)
            return tokenEventMap[token]
                ?: throw Exception("Token could not found in local cache")
        } catch (ex: SignatureException) {
            log.error("Invalid JWT signature")
            throw AccessDeniedException("Invalid JWT signature")
        } catch (ex: MalformedJwtException) {
            log.error("Invalid JWT token")
            throw AccessDeniedException("Invalid JWT token")
        } catch (ex: ExpiredJwtException) {
            log.error("Expired JWT token")
            throw AccessDeniedException("Expired JWT token")
        } catch (ex: UnsupportedJwtException) {
            log.error("Unsupported JWT token")
            throw AccessDeniedException("Unsupported JWT token")
        } catch (ex: IllegalArgumentException) {
            log.error("JWT claims string is empty.")
            throw AccessDeniedException("JWT claims string is empty.")
        }
    }

    fun markLogoutEventForToken(email: String) {
        tokenEventMap
            .filter { it.value.email == email }
            .forEach {
                run {
                    if (tokenEventMap.containsKey(it.key)) {
                        tokenEventMap.remove(it.key)
                    }
                }
            }
        log.debug("Logged out. Tokens for user $email removed in the cache")
    }
}