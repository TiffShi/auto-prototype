package com.instagram.service;

import com.instagram.dto.NotificationDTO;
import com.instagram.exception.ResourceNotFoundException;
import com.instagram.model.Notification;
import com.instagram.model.Notification.NotificationType;
import com.instagram.model.Post;
import com.instagram.model.User;
import com.instagram.repository.NotificationRepository;
import com.instagram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(this::mapToNotificationDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        notificationRepository.markAllAsReadForUser(user);
        log.info("Marked all notifications as read for user: {}", username);
    }

    @Transactional
    public void createLikeNotification(User actor, Post post) {
        Notification notification = Notification.builder()
                .type(NotificationType.LIKE)
                .message(actor.getUsername() + " liked your post")
                .recipient(post.getUser())
                .actor(actor)
                .post(post)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void createCommentNotification(User actor, Post post) {
        Notification notification = Notification.builder()
                .type(NotificationType.COMMENT)
                .message(actor.getUsername() + " commented on your post")
                .recipient(post.getUser())
                .actor(actor)
                .post(post)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void createFollowNotification(User actor, User recipient) {
        Notification notification = Notification.builder()
                .type(NotificationType.FOLLOW)
                .message(actor.getUsername() + " started following you")
                .recipient(recipient)
                .actor(actor)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationDTO mapToNotificationDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .actorId(notification.getActor().getId())
                .actorUsername(notification.getActor().getUsername())
                .actorAvatarUrl(notification.getActor().getAvatarUrl())
                .postId(notification.getPost() != null ? notification.getPost().getId() : null)
                .build();
    }
}