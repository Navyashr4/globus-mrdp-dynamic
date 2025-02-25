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
import { CollectionManage } from "@/components/CollectionManage";
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
            to manage data using the portal.
          </Text>
        </Center>
      </Container>
    );
  }

  return (
    <>
        <h1>
        Search Page
        </h1>
        <CollectionManage
                onSelect={(endpoint) => {
                    transferStore.setDestination(endpoint);
                    transferStore.setDestinationPath(endpoint.default_directory);
                    onDestinationClose(); // Close the drawer after destination selection
                }}
        />
    </>
  );
}
