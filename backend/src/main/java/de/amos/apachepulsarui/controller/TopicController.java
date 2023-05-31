/*
 * SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2023 Niklas Teschner <niklas.teschner@web.de>
 * SPDX-FileCopyrightText: 2023 Anna Haverkamp <anna.lucia.haverkamp@gmail.com>
 */

package de.amos.apachepulsarui.controller;

import de.amos.apachepulsarui.dto.ProducerDto;
import de.amos.apachepulsarui.dto.SubscriptionDto;
import de.amos.apachepulsarui.dto.TopicDto;
import de.amos.apachepulsarui.dto.TopicsDto;
import de.amos.apachepulsarui.service.NamespaceService;
import de.amos.apachepulsarui.service.TenantService;
import de.amos.apachepulsarui.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.apache.pulsar.common.naming.TopicName;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/topic")
public class TopicController {

    private final TopicService topicService;

    private final TenantService tenantService;

    private final NamespaceService namespaceService;


    // Talked about this with Julian - probably we won't use it this way later, but at first it's easier for them
    // to just get all topics at once.
    @GetMapping("/all")
    public ResponseEntity<TopicsDto> getAll() {
        List<String> allTopics = tenantService.getAllTenants().stream()
                .flatMap(tenantDto -> namespaceService.getAllOfTenant(tenantDto).stream())
                .flatMap(namespaceDto -> topicService.getAllNamesByNamespace(namespaceDto.getId()).stream())
                .toList();
        return new ResponseEntity<>(new TopicsDto(allTopics), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<TopicDto> getTopicWithMessagesByName(@RequestParam String name) {
       return new ResponseEntity<>(topicService.getTopicWithMessagesByName(name), HttpStatus.OK);
    }

    @GetMapping("/subscription/{subscription}")
    public ResponseEntity<SubscriptionDto> getSubyscriptionByNameAndTopic(@RequestParam String topic, @PathVariable String subscription) {
        return new ResponseEntity<>(topicService.getSubscriptionByTopic(topic, subscription), HttpStatus.OK);
    }

    @GetMapping("/producer/{producer}")
    public ResponseEntity<ProducerDto> getProducerByNameAndTopic(@RequestParam String topic, @PathVariable String producer) {
        return new ResponseEntity<>(topicService.getProducerByTopic(topic, producer), HttpStatus.OK);
    }


    @PostMapping("/new")
    public ResponseEntity<Void> newTopic(@RequestParam String topic) {
        if (!TopicName.isValid(topic)) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if (topicService.createNewTopic(topic)) {
            return new ResponseEntity<>(HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
