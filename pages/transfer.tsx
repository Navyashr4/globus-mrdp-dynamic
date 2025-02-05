import React, { useEffect, useState } from "react";
import {
  Box,
  Center,
  Container,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Button,
  SimpleGrid,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Card,
  CardBody,
  Link,
  Flex,
} from "@chakra-ui/react";

import FileBrowser from "@/components/file-browser/FileBrowser";
import { useGlobusAuth } from "@globus/react-auth-context";
import { CollectionSearch } from "@/components/CollectionSearch";
import { useCollection } from "@/hooks/useTransfer";
import { useGlobusTransferStore } from "@/components/store/globus-transfer";
import { useShallow } from "zustand/react/shallow";

export type TransferCollectionConfiguration = {
  collection_id: string;
  path?: string;
  label?: string;
};

export default function Transfer() {
  const auth = useGlobusAuth();
  const transferStore = useGlobusTransferStore();

  // Disclosures for opening search drawers
  const { isOpen: isSourceOpen, onOpen: onSourceOpen, onClose: onSourceClose } = useDisclosure();
  const { isOpen: isDestinationOpen, onOpen: onDestinationOpen, onClose: onDestinationClose } = useDisclosure();

  const { source, destination } = useGlobusTransferStore(
    useShallow((state) => ({
      source: state.source,
      destination: state.destination,
    }))
  );

  useEffect(() => {
    if (source) {
      transferStore.setSourcePath(source.default_directory || null);
    }
  }, [source]);

  if (!auth.isAuthenticated) {
    return (
      <Container>
        <Center mt={4}>
          <Text>
            You must{" "}
            <Link onClick={async () => await auth.authorization?.login()}>
              sign in
            </Link>{" "}
            to transfer data using the portal.
          </Text>
        </Center>
      </Container>
    );
  }

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={1}>
        {/* Source Selection */}
        <Box p={2}>
          <Flex mb={2} align="center" gap={2}>
            <InputGroup>
              <InputLeftAddon>Source</InputLeftAddon>
              <Input value={source ? source.display_name || source.name : "..."} variant="filled" isReadOnly />
            </InputGroup>
            <Button onClick={onSourceOpen} size="sm">
              Change Source
            </Button>
          </Flex>
          {source && <FileBrowser variant="source" collection={source.id} />}
        </Box>

        {/* Destination Selection */}
        <Box p={2}>
          <Flex mb={2} align="center" gap={2} pos="relative">
            <InputGroup>
              <InputLeftAddon>Destination</InputLeftAddon>
              <Input
                value={destination ? destination.display_name || destination.name : "..."}
                variant="filled"
                isReadOnly
              />
            </InputGroup>
            {/* "Change Destination" button appears when destination is selected */}
            <Box position="absolute" right={4}>
              <Button onClick={onDestinationOpen} size="sm">
                Change Destination
              </Button>
            </Box>
          </Flex>
          {destination ? (
            <FileBrowser variant="destination" collection={destination.id} />
          ) : (
            <Container>
              <Card variant="filled" size="sm">
                <CardBody>
                  <Text pb={2}>
                    You are viewing data from{" "}
                    <Text as="em">{source?.display_name || "Selected Source"}</Text>.
                    <br /> To transfer data to another location,{" "}
                    <Button onClick={onDestinationOpen} variant="link">
                      search for a destination
                    </Button>
                    .
                  </Text>
                </CardBody>
              </Card>
            </Container>
          )}
        </Box>
      </SimpleGrid>

      {/* Drawer for Source Selection */}
      <Drawer placement="left" onClose={onSourceClose} isOpen={isSourceOpen} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search for a Source</DrawerHeader>
          <DrawerBody>
            <CollectionSearch
              onSelect={(endpoint) => {
                transferStore.setSource(endpoint);
                transferStore.setSourcePath(endpoint.default_directory);
                onSourceClose(); // Close the drawer after source selection
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Drawer for Destination Selection */}
      <Drawer placement="right" onClose={onDestinationClose} isOpen={isDestinationOpen} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search for a Destination</DrawerHeader>
          <DrawerBody>
            <CollectionSearch
              onSelect={(endpoint) => {
                transferStore.setDestination(endpoint);
                transferStore.setDestinationPath(endpoint.default_directory);
                onDestinationClose(); // Close the drawer after destination selection
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
