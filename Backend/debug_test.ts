import { CodeExecutionService } from './src/services/codeExecutionService';
import * as dotenv from 'dotenv';
dotenv.config();

const code = `import java.util.*;

class Solution {
    public List<List<Integer>> solve(int[] input) {
        List<List<Integer>> result = new ArrayList<>();
        if (input == null || input.length < 3) return result;
        Arrays.sort(input);
        int n = input.length;
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && input[i] == input[i - 1]) continue;
            int left = i + 1;
            int right = n - 1;
            while (left < right) {
                int sum = input[i] + input[left] + input[right];
                if (sum == 0) {
                    result.add(Arrays.asList(input[i], input[left], input[right]));
                    while (left < right && input[left] == input[left + 1]) left++;
                    while (left < right && input[right] == input[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) left++;
                else right--;
            }
        }
        return result;
    }
}`;

const input = `16
-4 -2 1 -5 -4 -4 4 -2 0 4 0 -2 3 1 -5 0`;

async function test() {
    const result = await CodeExecutionService.executeCode(code, 'java', input);
    console.log('Result Output:', result.output);
    console.log('Result Error:', result.error);
    console.log('Is Error:', result.isError);
}

test();
