/*
 * SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2023 Niklas Teschner <niklas.teschner@web.de>
 * SPDX-FileCopyrightText: 2023 Anna Haverkamp <anna.lucia.haverkamp@gmail.com>
 */

package de.amos.apachepulsarui.service;

import de.amos.apachepulsarui.domain.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pulsar.client.admin.PulsarAdmin;
import org.apache.pulsar.client.admin.PulsarAdminException;
import org.apache.pulsar.client.api.Producer;
import org.apache.pulsar.client.api.PulsarClient;
import org.apache.pulsar.client.api.PulsarClientException;
import org.apache.pulsar.common.naming.TopicName;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@Scope("singleton")
@Slf4j
@RequiredArgsConstructor
public class MessageService {

    public static final int MAX_NUM_MESSAGES = 20;

    private final PulsarClient pulsarClient;
    private final PulsarAdmin pulsarAdmin;


    // TODO get all messages for all topics, instead of just the first one
    public List<Message> peekMessages(String topic) {
        try {
            List<String> subscriptions = pulsarAdmin.topics().getSubscriptions(topic);
            return peekMessages(topic, subscriptions.get(0));
        } catch (PulsarAdminException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Message> peekMessages(String topic, String subscription) {
        try {
            var messages = pulsarAdmin.topics().peekMessages(topic, subscription, MAX_NUM_MESSAGES);
            return messages.stream()
                    .map(message -> Message.builder()
                            .key(message.getKey())
                            .payload(new String(message.getData(), StandardCharsets.UTF_8))
                            .topic(message.getTopicName())
                            .build())
                    .toList();
        } catch (PulsarAdminException e) {
            throw new RuntimeException(e);
        }
    }

    public boolean sendMessage(Message message) {
        try (Producer<byte[]> producer = pulsarClient.newProducer()
                .topic(message.getTopic())
                .create()
        ) {
            producer.send(message.getPayload().getBytes(StandardCharsets.UTF_8));
            return true;
        } catch (PulsarClientException e) {
            log.error("Could not create producer for topic %s.".formatted(message.getTopic()));
            return false;
        }
    }

    public boolean isValidMessage(Message message) {
        return TopicName.isValid(message.getTopic());
    }

}
