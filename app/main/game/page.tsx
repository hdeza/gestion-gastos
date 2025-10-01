"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Star,
  Clock,
  RotateCcw,
  Home,
  Sparkles,
  Coins,
  Brain,
  Target,
  Zap,
} from "lucide-react";

interface Tile {
  id: number;
  value: number;
  position: number;
  isCorrect: boolean;
}

const INITIAL_BOARD = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

const GOAL_BOARD = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

export default function GamePage() {
  const router = useRouter();
  const [board, setBoard] = useState<number[][]>(INITIAL_BOARD);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameStarted && !isGameWon) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameStarted, isGameWon]);

  // Check if game is won
  useEffect(() => {
    if (JSON.stringify(board) === JSON.stringify(GOAL_BOARD)) {
      setIsGameWon(true);
      setIsGameStarted(false);
      calculateReward();
    }
  }, [board]);

  const calculateReward = () => {
    let tokens = 10; // Base tokens

    // Bonus por velocidad (menos de 60 segundos)
    if (time < 60) tokens += 5;

    // Bonus por eficiencia (menos de 50 movimientos)
    if (moves < 50) tokens += 5;

    // Bonus perfecto (menos de 30 segundos y 30 movimientos)
    if (time < 30 && moves < 30) tokens += 10;

    setTokensEarned(tokens);
    setShowReward(true);
  };

  const shuffleBoard = () => {
    const newBoard = [...INITIAL_BOARD];
    // Simple shuffle algorithm
    for (let i = 0; i < 1000; i++) {
      const emptyPos = findEmptyPosition(newBoard);
      const possibleMoves = getPossibleMoves(newBoard, emptyPos);
      const randomMove =
        possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      swapTiles(newBoard, emptyPos, randomMove);
    }
    return newBoard;
  };

  const findEmptyPosition = (board: number[][]) => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === 0) return { row: i, col: j };
      }
    }
    return { row: 0, col: 0 };
  };

  const getPossibleMoves = (
    board: number[][],
    emptyPos: { row: number; col: number }
  ) => {
    const moves = [];
    const { row, col } = emptyPos;

    if (row > 0) moves.push({ row: row - 1, col });
    if (row < 2) moves.push({ row: row + 1, col });
    if (col > 0) moves.push({ row, col: col - 1 });
    if (col < 2) moves.push({ row, col: col + 1 });

    return moves;
  };

  const swapTiles = (
    board: number[][],
    pos1: { row: number; col: number },
    pos2: { row: number; col: number }
  ) => {
    const temp = board[pos1.row][pos1.col];
    board[pos1.row][pos1.col] = board[pos2.row][pos2.col];
    board[pos2.row][pos2.col] = temp;
  };

  const handleTileClick = (row: number, col: number) => {
    if (isGameWon || isAnimating) return;

    const emptyPos = findEmptyPosition(board);
    const possibleMoves = getPossibleMoves(board, emptyPos);

    const clickedPos = { row, col };
    const canMove = possibleMoves.some(
      (move) => move.row === clickedPos.row && move.col === clickedPos.col
    );

    if (canMove) {
      setIsAnimating(true);
      const newBoard = board.map((row) => [...row]);
      swapTiles(newBoard, emptyPos, clickedPos);

      setBoard(newBoard);
      setMoves((prev) => prev + 1);

      if (!isGameStarted) {
        setIsGameStarted(true);
      }

      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  const resetGame = () => {
    setBoard(shuffleBoard());
    setMoves(0);
    setTime(0);
    setIsGameWon(false);
    setIsGameStarted(false);
    setShowReward(false);
    setTokensEarned(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTileIcon = (value: number) => {
    const icons = [
      null, // 0 (empty)
      <Coins className="h-6 w-6" />, // 1
      <Target className="h-6 w-6" />, // 2
      <Brain className="h-6 w-6" />, // 3
      <Zap className="h-6 w-6" />, // 4
      <Star className="h-6 w-6" />, // 5
      <Trophy className="h-6 w-6" />, // 6
      <Sparkles className="h-6 w-6" />, // 7
      <Clock className="h-6 w-6" />, // 8
    ];
    return icons[value];
  };

  const getTileColor = (value: number) => {
    const colors = [
      "bg-transparent", // 0 (empty)
      "bg-green-100 text-green-700 border-green-200", // 1
      "bg-blue-100 text-blue-700 border-blue-200", // 2
      "bg-purple-100 text-purple-700 border-purple-200", // 3
      "bg-yellow-100 text-yellow-700 border-yellow-200", // 4
      "bg-orange-100 text-orange-700 border-orange-200", // 5
      "bg-red-100 text-red-700 border-red-200", // 6
      "bg-pink-100 text-pink-700 border-pink-200", // 7
      "bg-indigo-100 text-indigo-700 border-indigo-200", // 8
    ];
    return colors[value];
  };

  if (showReward) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Felicitaciones!
            </h1>
            <p className="text-gray-600">
              Has completado el puzzle de gestión financiera
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">
                Tokens de IA Ganados
              </span>
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">
              +{tokensEarned}
            </div>
            <p className="text-sm text-gray-600">
              Usa estos tokens para consultas de IA sobre gestión de gastos
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Tiempo</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatTime(time)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Target className="h-4 w-4 text-green-600" />
                <span className="font-medium">Movimientos</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{moves}</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setShowReward(false);
                resetGame();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Jugar de Nuevo
            </button>
            <button
              onClick={() => router.push("/main/dashboard")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Puzzle Financiero
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            ¡Ordena los elementos financieros y gana tokens de IA para consultas
            sobre gestión de gastos!
          </p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Tiempo</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatTime(time)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Movimientos</div>
                <div className="text-xl font-bold text-gray-900">{moves}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Coins className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Tokens Disponibles</div>
                <div className="text-xl font-bold text-gray-900">
                  +{tokensEarned || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-3 gap-2">
              {board.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleTileClick(rowIndex, colIndex)}
                    className={`
                      w-20 h-20 rounded-xl border-2 transition-all duration-200 flex items-center justify-center
                      ${
                        value === 0
                          ? "bg-transparent border-dashed border-gray-300 cursor-default"
                          : `${getTileColor(
                              value
                            )} hover:scale-105 hover:shadow-lg cursor-pointer ${
                              isAnimating ? "animate-pulse" : ""
                            }`
                      }
                      ${isGameWon ? "animate-bounce" : ""}
                    `}
                    disabled={value === 0 || isGameWon}
                  >
                    {value !== 0 && (
                      <div className="flex flex-col items-center gap-1">
                        {getTileIcon(value)}
                        <span className="text-xs font-bold">{value}</span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={resetGame}
            className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg"
          >
            <RotateCcw className="h-5 w-5" />
            Reiniciar Juego
          </button>

          <button
            onClick={() => router.push("/main/dashboard")}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg"
          >
            <Home className="h-5 w-5" />
            Ir al Dashboard
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Cómo Jugar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="mb-2">
                • Haz clic en las fichas adyacentes al espacio vacío para
                moverlas
              </p>
              <p className="mb-2">
                • Ordena los números del 1 al 8 de izquierda a derecha, arriba a
                abajo
              </p>
            </div>
            <div>
              <p className="mb-2">
                • Gana tokens de IA según tu velocidad y eficiencia
              </p>
              <p>• Usa los tokens para consultas sobre gestión de gastos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
