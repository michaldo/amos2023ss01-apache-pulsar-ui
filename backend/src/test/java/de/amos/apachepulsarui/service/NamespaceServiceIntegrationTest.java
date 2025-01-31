/*
 * SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2023 Anna Haverkamp <anna.lucia.haverkamp@gmail.com>
 */

package de.amos.apachepulsarui.service;

import de.amos.apachepulsarui.dto.NamespaceDetailDto;
import de.amos.apachepulsarui.dto.NamespaceDto;
import org.apache.pulsar.client.admin.PulsarAdmin;
import org.apache.pulsar.client.admin.PulsarAdminException;
import org.apache.pulsar.common.policies.data.TenantInfo;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class NamespaceServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private NamespaceService namespaceService;

    @Autowired
    private PulsarAdmin pulsarAdmin;

    @BeforeAll
    void createTenantsAndNamespaces() throws PulsarAdminException {
        createTenant("tenant1");
        createTenant("tenant2");
        pulsarAdmin.namespaces().createNamespace("tenant1/namespace1");
        pulsarAdmin.namespaces().createNamespace("tenant1/namespace2");
        pulsarAdmin.namespaces().createNamespace("tenant2/namespace3");
    }

    @Test
    void getAllOfTenant_returnsNamespacesOfTenant() {
        List<String> namespaces = namespaceService.getAllOfTenant("tenant1");
        Assertions.assertThat(namespaces).contains("tenant1/namespace1", "tenant1/namespace2");
        Assertions.assertThat(namespaces).doesNotContain("tenant2/namespace3");
    }

    @Test
    void getAllForTenants_returnsAllNamespaces() {
        List<String> tenants = List.of("tenant1");
        NamespaceDto expectedNamespaceDto1 = NamespaceDto.fromString("tenant1/namespace1");
        NamespaceDto expectedNamespaceDto2 = NamespaceDto.fromString("tenant1/namespace2");

        List<String> namespaces = namespaceService.getAllForTenants(tenants).stream().map(NamespaceDto::getId).toList();
        assertTrue(namespaces.contains(expectedNamespaceDto1.getId()));
        assertTrue(namespaces.contains(expectedNamespaceDto2.getId()));


    }

    @Test
    void getAllForNamespaces_returnsAllNamespaces() {
        List<String> namespaces = List.of("tenant1/namespace1", "tenant2/namespace3");
        NamespaceDto expectedNamespaceDto1 = NamespaceDto.fromString("tenant1/namespace1");
        NamespaceDto expectedNamespaceDto2 = NamespaceDto.fromString("tenant2/namespace3");

        List<String> namespaceDtos = namespaceService.getAllForNamespaces(namespaces).stream().map(NamespaceDto::getId).toList();
        assertTrue(namespaceDtos.contains(expectedNamespaceDto1.getId()));
        assertTrue(namespaceDtos.contains(expectedNamespaceDto2.getId()));
    }

    @Test
    void getNamespaceDetails_returnsNamespaces() throws PulsarAdminException {
        pulsarAdmin.topics().createNonPartitionedTopic("persistent://tenant1/namespace1/testTopic");

        NamespaceDetailDto namespace = namespaceService.getNamespaceDetails("tenant1/namespace1");

        Assertions.assertThat(namespace.getName()).isEqualTo("tenant1/namespace1");
        Assertions.assertThat(namespace.getTopics()).contains("persistent://tenant1/namespace1/testTopic");
    }

    private void createTenant(String tenant) throws PulsarAdminException {
        var clusters = pulsarAdmin.clusters().getClusters();
        pulsarAdmin.tenants().createTenant(tenant, TenantInfo.builder()
                .allowedClusters(new HashSet<>(clusters)).build());
    }

}
