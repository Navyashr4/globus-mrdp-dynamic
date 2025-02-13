import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  Icon,
  List,
  ListItem,
  Card,
  CardHeader,
  Stack,
  CardBody,
  Text,
  Spinner,
  InputLeftAddon,
  FormControl,
  FormLabel,
  Switch,
  Tooltip,
} from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { transfer } from "@globus/sdk";

import { useGlobusAuth } from "@globus/react-auth-context";
import throttle from "lodash/throttle";
import { QuestionIcon } from "@chakra-ui/icons";

import mockData from "../mockdb.json"; // Importing mock data

type Endpoint = Record<string, any>;

export function CollectionSearch({
  onSelect = () => {},
}: {
  onSelect: (endpoint: Endpoint) => void;
}) {
  const auth = useGlobusAuth();
  const [results, setResults] = useState<Endpoint[]>([]);
  const [mockResults] = useState<Endpoint[]>(mockData); // Store mock data
  const [filteredMockResults, setFilteredMockResults] = useState<Endpoint[]>([]); // Initially empty  
  const [keyword, setKeyword] = useState<string | null>(null);
  const [scope, setScope] = useState<string>("hide-no-permissions");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const search = useCallback(
    throttle(async (query) => {
      const response = await transfer.endpointSearch(
        {
          query: {
            /**
             * In the context of the data portal, we only want to return
             * results that will support Globus Transfer behaviors.
             */
            filter_non_functional: false,
            filter_fulltext: query,
            filter_scope: scope,
            limit: 20,
          },
        },
        { manager: auth.authorization },
      );
      const data = await response.json();
      setResults(data && "DATA" in data ? data.DATA : []);
      setIsRefreshing(false);
    }, 500),
    [scope],
  );

  useEffect(() => {
    if (!keyword) {
      setResults([]);
      return;
    }
    setIsRefreshing(true);
    search(keyword);
  }, [search, keyword]);

  useEffect(() => {
    if (!keyword) {
      setResults([]);
      setFilteredMockResults([]); // No results initially
      return;
    }
  
    const lowerKeyword = keyword.toLowerCase();
    const isUrl = lowerKeyword.startsWith("http://") || lowerKeyword.startsWith("https://");
  
    if (isUrl) {
      // Exact match search for the `link` attribute
      const exactMatch = mockResults.find((entry) => entry.link === lowerKeyword);
      setFilteredMockResults(exactMatch ? [exactMatch] : []);
    } else {
      // Normal filtering for partial matches
      const filtered = mockResults.filter((entry) =>
        Object.values(entry).some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(lowerKeyword)
        )
      );
      setFilteredMockResults(filtered);
    }
  
    setIsRefreshing(true);
    search(keyword);
  }, [search, keyword, mockResults]);

  async function handleSearch(e: React.FormEvent<HTMLInputElement>) {
    const query = e.currentTarget.value;
    setKeyword(query ?? null);
  }

  function handleSelect(endpoint: Endpoint) {
    onSelect(endpoint);
  }

  return (
    <Stack>
      <Box position="sticky" top="0" zIndex={1} bgColor="white">
        <InputGroup>
          <InputLeftAddon>
            <Icon as={MagnifyingGlassIcon} />
          </InputLeftAddon>
          <Input
            aria-label="Search for a collection"
            onInput={(e) => handleSearch(e)}
            placeholder="e.g. Globus Tutorial Collection"
          />
        </InputGroup>
        <FormControl display="flex" alignItems="center" my="2">
          <Switch
            id="search-all"
            isChecked={scope === "all"}
            onChange={() => {
              setScope(scope === "all" ? "hide-no-permissions" : "all");
            }}
            mr={2}
          />
          <FormLabel htmlFor="search-all" mb="0">
            Search All Collections
          </FormLabel>
          <Tooltip label="By default, we'll hide collections you don't have Transfer-related permissions on. If you can't find what you're looking for, you can search all public collections.">
            <Icon as={QuestionIcon} />
          </Tooltip>
        </FormControl>
        <Box mb={2}>
          {isRefreshing && (
            <Text fontSize="sm">
              <Spinner size="xs" /> Fetching results...
            </Text>
          )}
        </Box>
      </Box>

      {/* Render mock data first */}
      {filteredMockResults.map((result) => (
        <Card
          size="sm"
          variant="filled"
          key={result.id}
          onClick={() => handleSelect(result)}
          _hover={{ cursor: "pointer", borderColor: "green.500" }}
        >
          <CardHeader pb={0}>
            <Text>{result.name}</Text>
          </CardHeader>
          <CardBody>
            <List>
              <Text fontSize="xs">
                <ListItem>ID: {result.id}</ListItem>
                <ListItem>Owner: {result.owner}</ListItem>
                {result.description && (
                  <ListItem>
                    <Text noOfLines={1}>Description: {result.description}</Text>
                  </ListItem>
                )}
                {result.link && <ListItem>{result.link}</ListItem>}
              </Text>
            </List>
          </CardBody>
        </Card>
      ))}

      {results.map((result) => (
        <Card
          size="sm"
          variant="outline"
          key={result.id}
          onClick={() => handleSelect(result)}
          _hover={{ cursor: "pointer", borderColor: "blue.500" }}
        >
          <CardHeader pb={0}>
            <Text>{result.display_name || result.name}</Text>
            <Text fontSize="xs">{result.entity_type}</Text>
          </CardHeader>
          <CardBody>
            <List>
              <Text fontSize="xs">
                <ListItem>ID: {result.id}</ListItem>
                <ListItem>Owner: {result.owner_id}</ListItem>
                {result.description && (
                  <ListItem>
                    <Text noOfLines={1}>Description: {result.description}</Text>
                  </ListItem>
                )}
                {result.tlsftp_server && (
                  <ListItem>
                    {transfer.utils.getDomainFromEndpoint(result)}
                  </ListItem>
                )}
              </Text>
            </List>
          </CardBody>
        </Card>
      ))}
    </Stack>
  );
}
