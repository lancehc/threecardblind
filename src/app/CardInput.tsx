"use client";

import { useEffect, useState } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

const FORM_WIDTH = 400;

export default function CardsForm() {
  // Fetch all the legal cards names from the api.
  const [cardNames, setCardNames] = useState([]);
  useEffect(() => {
    const fetchBar = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api`);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        setCardNames(data.cardNames);
      } catch (error) {
        console.error("Error fetching card names: ", error);
      }
    };

    fetchBar();
  }, []);

  return (
    <Stack direction="column" spacing={2}>
      <CardInput label="Card 1" cardNames={cardNames} />
      <CardInput label="Card 2" cardNames={cardNames} />
      <CardInput label="Card 3" cardNames={cardNames} />
    </Stack>
  );
}

function CardInput({
  label,
  cardNames,
}: {
  label?: string;
  cardNames: Array<string>;
}) {
  const [searchString, setSearchString] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");
  const [imageURIs, setImageURIs] = useState<string[]>([]);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!selectedCard) {
          return;
        }
        const response = await fetch(
          `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(selectedCard)}`,
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.image_uris?.normal) {
          setImageURIs([data.image_uris.normal]);
        } else if (data.card_faces) {
          setImageURIs(
            data.card_faces
              .map((face: any) => face.image_uris?.normal)
              .filter(Boolean),
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedCard]);

  const showImages =
    hovering &&
    searchString.toLowerCase() === selectedCard.toLowerCase() &&
    imageURIs.length >= 1;

  const images = !showImages ? null : (
    <Stack direction="row" sx={{ position: "absolute", zIndex: 3 }}>
      {imageURIs.map((imageURI) => (
        <img
          src={imageURI}
          key={imageURI}
          style={{
            width: FORM_WIDTH,
          }}
        />
      ))}
    </Stack>
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchString(event.target.value);
  }

  function handleBlur() {
    setFocused(false);
    if (selectedCard) {
      setSearchString(selectedCard);
    } else {
      setSearchString("");
    }
  }

  function handleFocus() {
    setFocused(true);
  }

  function handleCardSelected(cardName: string) {
    setSelectedCard(cardName);
    setSearchString(cardName);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (["Enter", "Tab"].includes(event.key) && filteredCardNames.length > 0) {
      handleCardSelected(filteredCardNames[0]);
    }
  }

  const filteredCardNames =
    focused && searchString
      ? cardNames
          .filter((name) =>
            name.toLowerCase().startsWith(searchString.toLowerCase()),
          )
          .slice(0, 11)
      : [];

  return (
    <List>
      <TextField
        id="card1"
        className="cardForm"
        label={label}
        variant="filled"
        value={searchString}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onMouseOver={() => {
          setHovering(true);
        }}
        onMouseOut={() => {
          setHovering(false);
        }}
        sx={{
          position: "relative",
          width: FORM_WIDTH,
          zIndex: 1,
        }}
      />
      <CardOptionList
        filteredCardNames={filteredCardNames}
        handleCardSelected={handleCardSelected}
      />
      {images}
    </List>
  );
}

function CardOptionList({
  filteredCardNames,
  handleCardSelected,
}: {
  filteredCardNames: string[];
  handleCardSelected: (a: string) => void;
}) {
  if (filteredCardNames.length === 0) {
    return;
  }

  return (
    <List
      disablePadding
      sx={{
        position: "absolute",
        zIndex: 2,
        backgroundColor: "#fff",
        // Without the boxShadow, the list matches the background, so you can't see where the borders are.
        boxShadow:
          "0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 2px 7px 0 rgba(0, 0, 0, 0.19)",
        width: FORM_WIDTH,
      }}
    >
      {filteredCardNames.map((name) => (
        <ListItem disableGutters disablePadding key={name}>
          <ListItemButton
            tabIndex={-1} // Don't allow these to be focused by Tab.
            onMouseDown={() => handleCardSelected(name)}
            // selected={true}
          >
            <ListItemText className="cardForm">{name}</ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
