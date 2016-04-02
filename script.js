$(function () {
  /**
   *
   * Battleship AI Practice
   *
   * Two functions are defined below:
   * setupStrategy and playStrategy.
   * They are really simple functions right now,
   * they play randomly with no real strategy.
   * The playStrategy doesn't even consider previous guesses!
   * Try to improve them.
   *
   */
  
  /**
   *
   * Input: nxm array of undefined values, e.g.,
   * [[undefined, undefined, undefined],
   *  [undefined, undefined, undefined],
   *  [undefined, undefined, undefined]]
   *
   * Must return an array of five pieces
   * of length 5, 4, 3, 3, and 2.
   * Each piece consists of an array of contiguous cells.
   * Each cell is an [x, y] location.
   * Pieces must not overlap.
   *
   * Example output:
   * [
   *  [[8, 1], [8, 2], [8, 3], [8, 4], [8, 5]],
   *  [[7, 6], [7, 7], [7, 8], [7, 9]],
   *  [[2, 6], [3, 6], [4, 6]],
   *  [[6, 4], [6, 5], [6, 6]],
   *  [[3, 5], [4, 5]]
   * ]
   *
   * You may modify the board that is given in input.
   * It is just a copy that will be thrown away.
   *
   */
  function setupStrategy (board) {
    return [5, 4, 3, 3, 2].map(function (size) {
      while (1) {
        var blocks = randomBlocks(board, size);
        if (fits(board, blocks)) {
          placeBlocks(board, blocks);
          return blocks;
        }
      }
    });

    function randomBlocks (board, size) {
      var blocks = [[
        _.random(size-1, board.length-1),
        _.random(board[0].length-1)
      ]];
      while (--size) {
        blocks.unshift([blocks[0][0]-1, blocks[0][1]]);
      }
      if (_.random(1)) {
        blocks = blocks.map(function (b) {
          return [b[1], b[0]];
        });
      }
      return blocks;
    }
    
    function fits (board, blocks) {
      return blocks.every(function (b) {
        return !board[b[0]][b[1]];
      });
    }
  
    function placeBlocks (board, blocks) {
      blocks.forEach(function (b) {
        board[b[0]][b[1]] = 1;
      });
    }
  }
  
  /**
   * Input: nxm array of your previous guesses and their outcomes.
   * where 'M' marks a Miss and 'H' marks a Hit. Other cells are undefined.
   * For example:
   * [[   ,   ,   ,   ,   ,   ],
   *  [   ,'H','H',   ,'M',   ],
   *  [   ,   ,   ,   ,   ,   ],
   *  [   ,   ,   ,'M',   ,   ],
   *  [   ,   ,   ,   ,   ,   ],
   *  [   ,   ,   ,   ,   ,   ]]
   *
   * Locations are stored as an array like [x,y] which refer to the board
   * location as `board[x][y]`.
   *
   * When you've made your guess, call the callback with a location argument.
   * e.g., `callback([5, 2])`
   *
   */
  function playStrategy (guesses, callback) {
    // Timeout makes it look like the AI is "thinking"
    setTimeout(function () {
      callback(randomCell(guesses));
    }, 500);
    
    function randomCell (board) {
      return [
        _.random(guesses.length-1),
        _.random(guesses[0].length-1)
      ];
    }
  }

  /**
   *
   * Example solution for a playStrategy which doesn't repeat guesses.
   *
   * function playStrategy (guesses, callback) {
   *   while (1) {
   *     var guess = randomCell(guesses);
   *     if (!guesses[guess[0]][guess[1]]) {
   *       return callback(guess);
   *     }
   *   }
   *   
   *   function randomCell (board) {
   *     return [
   *       _.random(guesses.length-1),
   *       _.random(guesses[0].length-1)
   *     ];
   *   }
   * }
   *
   */
  
  /////
  // No need to read the rest of this
  /////
  
  runGame();
  
  function runGame () {
    var width = 10;
    var height = 10;
    var myBoard = emptyBoard(width, height);
    var myGuesses = emptyBoard(width, height);
    var oppBoard = emptyBoard(width, height);
    var oppGuesses = emptyBoard(width, height);
    setupPieces(myBoard);
    setupPieces(oppBoard);
    doTurn(0);
    
    function setupPieces (board) {
      var pieces = setupStrategy(emptyBoard(width, height));
      // todo verify pieces
      pieces = _.sortBy(pieces, 'length');
      ['A', 'B', 'C', 'D', 'E'].forEach(function (name, i) {
        placeBlocks(board, pieces[i], name);
      });
    }
    
    function placeBlocks (board, blocks, value) {
      value = value || 1;
      blocks.forEach(function (b) {
        board[b[0]][b[1]] = value;
      });
    }
    
    function doTurn (turn) {
      render();
      if (turn % 2) {
        playStrategy(oppGuesses, function (guess) {
          var correct = !!cellValue(myBoard, guess);
          placeBlocks(oppGuesses, [guess], correct ? 'H' : 'M');
          doTurn(turn+1);
        });
      } else {
        manualInputStrategy(myGuesses, function (guess) {
          var correct = !!cellValue(oppBoard, guess);
          placeBlocks(myGuesses, [guess], correct ? 'H' : 'M');
          doTurn(turn+1);
        });
      }
    }
  
    function render () {
      $('#my-board').empty().append(renderBoard(myBoard, oppGuesses));
      $('#my-guesses').empty().append(renderBoard(myGuesses));
    }
  
    function verifyPieces (pieces) {
      var sizes = pieces.map(function (p) {
        return p.length;
      }).sort();
      // todo make sure pieces are contiguous and within bounds
      return _.isEqual(sizes, [5, 4, 3, 3, 2]);
    }
    
    function manualInputStrategy (guesses, callback) {
      $('#my-guesses').one('click', 'td', function () {
        callback($(this).data('position'));
      });
    }
    
    function cellValue (board, cell) {
      return board[cell[0]][cell[1]];
    }
    
    function emptyBoard (width, height) {
      return Array.apply(null, {length: height}).map(function() {
        return Array.apply(null, {length: width})
      });
    }

    function renderBoard (board, guesses) {
      return $('<tbody>').append(board.map(function (row, r) {
        return $('<tr>').append(row.map(function (cell, c) {
          return $('<td>').append(
            $('<div>').text(cell)
          ).data('position', [r, c])
          .toggleClass('correct', cellValue(guesses || board, [r, c]) === 'H')
          .toggleClass('incorrect', cellValue(guesses || board, [r, c]) === 'M');
        }));
      }));
    }
  }
});