type LanguageConfig = Record<
  string,
  {
    id: string;
    label: string;
    pistonRuntime: { language: string; version: string };
    monacoLanguage: string;
    defaultCode: string;
  }
>;

export const LANGUAGE_CONFIG: LanguageConfig = {
  javascript: {
    id: "javascript",
    label: "JavaScript",
    pistonRuntime: { language: "javascript", version: "18.15.0" }, // api that we're gonna be using
    monacoLanguage: "javascript",
    defaultCode: `// JavaScript Playground
  const numbers = [1, 2, 3, 4, 5];
  
  // Map numbers to their squares
  const squares = numbers.map(n => n * n);
  console.log('Original numbers:', numbers);
  console.log('Squared numbers:', squares);
  
  // Filter for even numbers
  const evenNumbers = numbers.filter(n => n % 2 === 0);
  console.log('Even numbers:', evenNumbers);
  
  // Calculate sum using reduce
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  console.log('Sum of numbers:', sum);`,
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    pistonRuntime: { language: "typescript", version: "5.0.3" },
    monacoLanguage: "typescript",
    defaultCode: `// TypeScript Playground
  interface NumberArray {
    numbers: number[];
    sum(): number;
    squares(): number[];
    evenNumbers(): number[];
  }
  
  class MathOperations implements NumberArray {
    constructor(public numbers: number[]) {}
  
    sum(): number {
      return this.numbers.reduce((acc, curr) => acc + curr, 0);
    }
  
    squares(): number[] {
      return this.numbers.map(n => n * n);
    }
  
    evenNumbers(): number[] {
      return this.numbers.filter(n => n % 2 === 0);
    }
  }
  
  const math = new MathOperations([1, 2, 3, 4, 5]);
  
  console.log('Original numbers:', math.numbers);
  console.log('Squared numbers:', math.squares());
  console.log('Even numbers:', math.evenNumbers());
  console.log('Sum of numbers:', math.sum());`,
  },
  python: {
    id: "python",
    label: "Python",
    pistonRuntime: { language: "python", version: "3.10.0" },
    monacoLanguage: "python",
    defaultCode: `# Python Playground
  numbers = [1, 2, 3, 4, 5]
  
  # Map numbers to their squares
  squares = [n ** 2 for n in numbers]
  print(f"Original numbers: {numbers}")
  print(f"Squared numbers: {squares}")
  
  # Filter for even numbers
  even_numbers = [n for n in numbers if n % 2 == 0]
  print(f"Even numbers: {even_numbers}")
  
  # Calculate sum
  numbers_sum = sum(numbers)
  print(f"Sum of numbers: {numbers_sum}")`,
  },
  java: {
    id: "java",
    label: "Java",
    pistonRuntime: { language: "java", version: "15.0.2" },
    monacoLanguage: "java",
    defaultCode: `public class Main {
    public static void main(String[] args) {
        // Create array
        int[] numbers = {1, 2, 3, 4, 5};
        
        // Print original numbers
        System.out.print("Original numbers: ");
        printArray(numbers);
        
        // Calculate and print squares
        int[] squares = new int[numbers.length];
        for (int i = 0; i < numbers.length; i++) {
            squares[i] = numbers[i] * numbers[i];
        }
        System.out.print("Squared numbers: ");
        printArray(squares);
        
        // Print even numbers
        System.out.print("Even numbers: ");
        for (int n : numbers) {
            if (n % 2 == 0) System.out.print(n + " ");
        }
        System.out.println();
        
        // Calculate and print sum
        int sum = 0;
        for (int n : numbers) sum += n;
        System.out.println("Sum of numbers: " + sum);
    }
    
    private static void printArray(int[] arr) {
        for (int n : arr) System.out.print(n + " ");
        System.out.println();
    }
  }`,
  },
  go: {
    id: "go",
    label: "Go",
    pistonRuntime: { language: "go", version: "1.16.2" },
    monacoLanguage: "go",
    defaultCode: `package main
  
  import "fmt"
  
  func main() {
    // Create slice
    numbers := []int{1, 2, 3, 4, 5}
    
    // Print original numbers
    fmt.Println("Original numbers:", numbers)
    
    // Calculate squares
    squares := make([]int, len(numbers))
    for i, n := range numbers {
        squares[i] = n * n
    }
    fmt.Println("Squared numbers:", squares)
    
    // Filter even numbers
    var evenNumbers []int
    for _, n := range numbers {
        if n%2 == 0 {
            evenNumbers = append(evenNumbers, n)
        }
    }
    fmt.Println("Even numbers:", evenNumbers)
    
    // Calculate sum
    sum := 0
    for _, n := range numbers {
        sum += n
    }
    fmt.Println("Sum of numbers:", sum)
  }`,
  },
  rust: {
    id: "rust",
    label: "Rust",
    pistonRuntime: { language: "rust", version: "1.68.2" },
    monacoLanguage: "rust",
    defaultCode: `fn main() {
      // Create vector
      let numbers = vec![1, 2, 3, 4, 5];
      
      // Print original numbers
      println!("Original numbers: {:?}", numbers);
      
      // Calculate squares
      let squares: Vec<i32> = numbers
          .iter()
          .map(|&n| n * n)
          .collect();
      println!("Squared numbers: {:?}", squares);
      
      // Filter even numbers
      let even_numbers: Vec<i32> = numbers
          .iter()
          .filter(|&&n| n % 2 == 0)
          .cloned()
          .collect();
      println!("Even numbers: {:?}", even_numbers);
      
      // Calculate sum
      let sum: i32 = numbers.iter().sum();
      println!("Sum of numbers: {}", sum);
  }`,
  },
  cpp: {
    id: "cpp",
    label: "C++",
    pistonRuntime: { language: "cpp", version: "10.2.0" },
    monacoLanguage: "cpp",
    defaultCode: `#include <iostream>
  #include <vector>
  #include <algorithm>
  #include <numeric>
  
  int main() {
      // Create vector
      std::vector<int> numbers = {1, 2, 3, 4, 5};
      
      // Print original numbers
      std::cout << "Original numbers: ";
      for (int n : numbers) std::cout << n << " ";
      std::cout << std::endl;
      
      // Calculate squares
      std::vector<int> squares;
      std::transform(numbers.begin(), numbers.end(), 
                    std::back_inserter(squares),
                    [](int n) { return n * n; });
      
      std::cout << "Squared numbers: ";
      for (int n : squares) std::cout << n << " ";
      std::cout << std::endl;
      
      // Filter even numbers
      std::cout << "Even numbers: ";
      for (int n : numbers) {
          if (n % 2 == 0) std::cout << n << " ";
      }
      std::cout << std::endl;
      
      // Calculate sum
      int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
      std::cout << "Sum of numbers: " << sum << std::endl;
      
      return 0;
  }`,
  },
  csharp: {
    id: "csharp",
    label: "C#",
    pistonRuntime: { language: "csharp", version: "6.12.0" },
    monacoLanguage: "csharp",
    defaultCode: `using System;
  using System.Linq;
  
  class Program {
      static void Main() {
          // Create array
          int[] numbers = { 1, 2, 3, 4, 5 };
          
          // Print original numbers
          Console.WriteLine($"Original numbers: {string.Join(" ", numbers)}");
          
          // Calculate squares
          var squares = numbers.Select(n => n * n);
          Console.WriteLine($"Squared numbers: {string.Join(" ", squares)}");
          
          // Filter even numbers
          var evenNumbers = numbers.Where(n => n % 2 == 0);
          Console.WriteLine($"Even numbers: {string.Join(" ", evenNumbers)}");
          
          // Calculate sum
          var sum = numbers.Sum();
          Console.WriteLine($"Sum of numbers: {sum}");
      }
  }`,
  },
  ruby: {
    id: "ruby",
    label: "Ruby",
    pistonRuntime: { language: "ruby", version: "3.0.1" },
    monacoLanguage: "ruby",
    defaultCode: `# Create array
  numbers = [1, 2, 3, 4, 5]
  
  # Print original numbers
  puts "Original numbers: #{numbers.join(' ')}"
  
  # Calculate squares
  squares = numbers.map { |n| n * n }
  puts "Squared numbers: #{squares.join(' ')}"
  
  # Filter even numbers
  even_numbers = numbers.select { |n| n.even? }
  puts "Even numbers: #{even_numbers.join(' ')}"
  
  # Calculate sum
  sum = numbers.sum
  puts "Sum of numbers: #{sum}"`,
  },
  swift: {
    id: "swift",
    label: "Swift",
    pistonRuntime: { language: "swift", version: "5.3.3" },
    monacoLanguage: "swift",
    defaultCode: `// Create array
  let numbers = [1, 2, 3, 4, 5]
  
  // Print original numbers
  print("Original numbers: \\(numbers)")
  
  // Calculate squares
  let squares = numbers.map { $0 * $0 }
  print("Squared numbers: \\(squares)")
  
  // Filter even numbers
  let evenNumbers = numbers.filter { $0 % 2 == 0 }
  print("Even numbers: \\(evenNumbers)")
  
  // Calculate sum
  let sum = numbers.reduce(0, +)
  print("Sum of numbers: \\(sum)")`,
  },
};
