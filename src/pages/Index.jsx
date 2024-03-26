import React, { useState, useEffect } from "react";
import { Box, Button, Text, VStack } from "@chakra-ui/react";

const PLAYER_SIZE = 20;
const ZOMBIE_SIZE = 20;
const PLAYER_SPEED = 5;
const ZOMBIE_SPEED = 1;
const BULLET_SPEED = 10;
const LEVEL_MULTIPLIER = 1.2;

const Index = () => {
  const [player, setPlayer] = useState({ x: 0, y: 0, health: 100 });
  const [zombies, setZombies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Move zombies towards player
      setZombies((prevZombies) =>
        prevZombies.map((zombie) => {
          const dx = player.x - zombie.x;
          const dy = player.y - zombie.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return {
            ...zombie,
            x: zombie.x + (dx / distance) * ZOMBIE_SPEED,
            y: zombie.y + (dy / distance) * ZOMBIE_SPEED,
          };
        }),
      );

      // Move bullets
      setBullets((prevBullets) =>
        prevBullets.map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.dx * BULLET_SPEED,
          y: bullet.y + bullet.dy * BULLET_SPEED,
        })),
      );

      // Check collision between zombies and bullets
      setZombies((prevZombies) =>
        prevZombies.filter((zombie) => {
          const collided = bullets.some((bullet) => Math.abs(zombie.x - bullet.x) < ZOMBIE_SIZE / 2 && Math.abs(zombie.y - bullet.y) < ZOMBIE_SIZE / 2);
          if (collided) {
            setPoints((prevPoints) => prevPoints + 1);
          }
          return !collided;
        }),
      );

      // Check collision between player and zombies
      if (zombies.some((zombie) => Math.abs(player.x - zombie.x) < PLAYER_SIZE / 2 && Math.abs(player.y - zombie.y) < PLAYER_SIZE / 2)) {
        setPlayer((prevPlayer) => ({
          ...prevPlayer,
          health: prevPlayer.health - 10,
        }));
      }

      // Check game over
      if (player.health <= 0) {
        setGameOver(true);
      }
    }, 50);

    return () => {
      clearInterval(intervalId);
    };
  }, [player, zombies, bullets]);

  const spawnZombies = () => {
    const mapSize = 200 + level * 50;
    const count = Math.floor(level * LEVEL_MULTIPLIER);
    const newZombies = Array.from({ length: count }, () => ({
      x: Math.random() * mapSize,
      y: Math.random() * mapSize,
    }));
    setZombies((prevZombies) => [...prevZombies, ...newZombies]);
  };

  const handleMove = (dx, dy) => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      x: prevPlayer.x + dx * PLAYER_SPEED,
      y: prevPlayer.y + dy * PLAYER_SPEED,
    }));
  };

  const handleShoot = () => {
    const dx = Math.random() * 2 - 1;
    const dy = Math.random() * 2 - 1;
    const bullet = { x: player.x, y: player.y, dx, dy };
    setBullets((prevBullets) => [...prevBullets, bullet]);
  };

  const startNextLevel = () => {
    setLevel((prevLevel) => prevLevel + 1);
    setPlayer({ x: 0, y: 0, health: 100 });
    setZombies([]);
    setBullets([]);
    spawnZombies();
  };

  return (
    <Box>
      <Text>Level: {level}</Text>
      <Text>Points: {points}</Text>
      <Text>Health: {player.health}</Text>
      <Box position="relative" width={`${200 + level * 50}px`} height={`${200 + level * 50}px`} bg="gray.200">
        <Box position="absolute" left={player.x} top={player.y} width={`${PLAYER_SIZE}px`} height={`${PLAYER_SIZE}px`} bg="blue.500" />
        {zombies.map((zombie, index) => (
          <Box key={index} position="absolute" left={zombie.x} top={zombie.y} width={`${ZOMBIE_SIZE}px`} height={`${ZOMBIE_SIZE}px`} bg="green.500" />
        ))}
        {bullets.map((bullet, index) => (
          <Box key={index} position="absolute" left={bullet.x} top={bullet.y} width="4px" height="4px" bg="red.500" />
        ))}
      </Box>
      <VStack mt={4}>
        <Button onClick={() => handleMove(0, -1)}>Up</Button>
        <Box>
          <Button onClick={() => handleMove(-1, 0)}>Left</Button>
          <Button onClick={() => handleMove(1, 0)}>Right</Button>
        </Box>
        <Button onClick={() => handleMove(0, 1)}>Down</Button>
        <Button onClick={handleShoot} colorScheme="red">
          Shoot
        </Button>
      </VStack>
      {gameOver && (
        <Box mt={4}>
          <Text>Game Over!</Text>
          <Button onClick={startNextLevel}>Start Next Level</Button>
        </Box>
      )}
    </Box>
  );
};

export default Index;
