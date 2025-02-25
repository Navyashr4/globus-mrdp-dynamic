import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@chakra-ui/react";
import axios from "axios";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newEntry: { 
    name: string; 
    id: string; 
    owner_id: string; 
    description: string; 
    link: string; 
  }) => void;
  owner_id: string;   // Read-only field
  collection_id: string; // Read-only field
}

const DiamondCreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose, onSubmit, owner_id, collection_id }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  // const handleSubmit = () => {
  //   if (name.trim() && link.trim()) {
  //     onSubmit({
  //       name,
  //       id: collection_id, // Use the pre-filled collection_id
  //       owner_id, // Use the pre-filled owner_id
  //       description,
  //       link,
  //     });

  //     setName(""); 
  //     setDescription(""); 
  //     setLink(""); 
  //     onClose(); 
  //   }
  // };

  const handleSubmit = () => {
    const newEntry = {
      name,
      id: collection_id, // You should use a real method to generate unique IDs
      owner_id,
      description,
      link,
    };

    // Send new entry to the backend
    axios
      .post("http://localhost:3001/data", newEntry)
      .then((response) => {
        console.log("New entry added:", response.data);
        onSubmit(newEntry); // Call the parent component's onSubmit function to handle state update
        setName("");
        setDescription("");
        setLink("");
        onClose();
      })
      .catch((error) => {
        console.error("Error adding new entry:", error);
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Entry</ModalHeader>
        <ModalBody>
          <Input placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input mt={2} placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input mt={2} placeholder="Enter link" value={link} onChange={(e) => setLink(e.target.value)} />
          <Input
            mt={2}
            value={owner_id}
            isReadOnly
            variant="filled"
            bg="gray.50" // Background color stays gray
            border="none"
            _hover={{ bg: "gray.50", boxShadow: "none", cursor: "not-allowed"}} // Keeps the background the same on hover
            _focus={{ bg: "gray.50", boxShadow: "none"}} // Keeps the background the same on focus
            color="black" // Ensures the text stays black
          /> {/* Read-only Owner ID */}

          <Input
            mt={2}
            value={collection_id}
            isReadOnly
            variant="filled"
            bg="gray.50" // Background color stays gray
            _hover={{ bg: "gray.50", boxShadow: "none", cursor: "not-allowed"}} // Keeps the background the same on hover
            _focus={{ bg: "gray.50", boxShadow: "none"}} // Keeps the background the same on focus
            color="black" // Ensures the text stays black
          /> {/* Read-only Collection ID */}

        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>Submit</Button>
          <Button variant="ghost" onClick={onClose} ml={2}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DiamondCreateModal;
