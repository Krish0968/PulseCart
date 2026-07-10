package com.pulsecart.repository;

import com.pulsecart.model.UserRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<UserRecommendation, Long> {

    @Query("SELECT r FROM UserRecommendation r JOIN FETCH r.product p LEFT JOIN FETCH p.category WHERE r.user.id = :userId ORDER BY r.score DESC")
    List<UserRecommendation> findByUserIdOrderByScoreDesc(@Param("userId") Long userId);

    void deleteByUserId(Long userId);
}
