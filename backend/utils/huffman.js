class HuffmanNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char; // 'HIGH', 'LOW', etc.
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

// Tokenizes string like "HIGH LOW HIGH" into array ["HIGH", "LOW", "HIGH"]
// We also preserve spaces if we were doing true string compression, 
// but for educational traffic data, treating tokens as atomic values is clearer.
const tokenize = (data) => data.trim().split(/\s+/);

const calculateFrequencies = (tokens) => {
  const freqMap = {};
  tokens.forEach(token => {
    freqMap[token] = (freqMap[token] || 0) + 1;
  });
  return freqMap;
};

const buildTree = (frequencies) => {
  // Create leaf nodes
  let nodes = Object.entries(frequencies).map(([char, freq]) => new HuffmanNode(char, freq));

  if (nodes.length === 0) return null;
  if (nodes.length === 1) {
    // Edge case for only one unique token
    return new HuffmanNode(null, nodes[0].freq, nodes[0], null);
  }

  // Build tree using a simple sort array as priority queue
  while (nodes.length > 1) {
    // Sort descending so pop() gets the smallest frequency
    nodes.sort((a, b) => b.freq - a.freq);
    
    let left = nodes.pop();
    let right = nodes.pop();
    
    let parent = new HuffmanNode(null, left.freq + right.freq, left, right);
    nodes.push(parent);
  }

  return nodes[0];
};

const generateCodes = (node, prefix = "", codes = {}) => {
  if (!node) return codes;
  
  if (node.char !== null) {
    // If it's a leaf node, and prefix is empty (edge case 1 char), assign "0"
    codes[node.char] = prefix === "" ? "0" : prefix;
  }
  
  generateCodes(node.left, prefix + "0", codes);
  generateCodes(node.right, prefix + "1", codes);
  
  return codes;
};

const compress = (data) => {
  if (!data || data.trim() === "") {
    return { encodedData: "", tree: null, codes: {}, ratio: 0, originalBits: 0, compressedBits: 0, frequencies: {} };
  }

  const tokens = tokenize(data);
  const frequencies = calculateFrequencies(tokens);
  const tree = buildTree(frequencies);
  const codes = generateCodes(tree);

  const encodedData = tokens.map(token => codes[token]).join("");

  // Calculate bits
  // Standard ASCII: 8 bits per character (including spaces)
  const originalBits = data.length * 8; 
  const compressedBits = encodedData.length;
  const ratio = originalBits > 0 ? (originalBits / compressedBits).toFixed(2) : 0;

  return {
    frequencies,
    tree,
    codes,
    encodedData,
    originalBits,
    compressedBits,
    ratio: parseFloat(ratio)
  };
};

const decompress = (encodedData, tree) => {
  if (!tree || !encodedData) return "";
  
  let decodedTokens = [];
  let currentNode = tree;

  // Handle single node edge case
  if (tree.left === null && tree.right === null) {
    for(let i=0; i<encodedData.length; i++) {
        decodedTokens.push(tree.char);
    }
    return decodedTokens.join(" ");
  }

  for (let i = 0; i < encodedData.length; i++) {
    const bit = encodedData[i];
    if (bit === "0") {
      currentNode = currentNode.left;
    } else {
      currentNode = currentNode.right;
    }

    if (currentNode.char !== null) {
      decodedTokens.push(currentNode.char);
      currentNode = tree; // reset to root
    }
  }

  return decodedTokens.join(" "); // Re-add spaces
};

module.exports = {
  tokenize,
  calculateFrequencies,
  buildTree,
  generateCodes,
  compress,
  decompress,
};
