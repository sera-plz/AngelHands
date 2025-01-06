import argparse
import json
import os
from glob import glob

import pandas as pd
from tqdm import tqdm

tqdm.pandas()


# Load trajectories for resolved instances
def load_completions(output_dir: str, instance_id: str):
    glob_path = os.path.join(output_dir, 'llm_completions', instance_id, '*.json')
    files = sorted(glob(glob_path))  # this is ascending order
    # pick the last file (last turn)
    try:
        file_path = files[-1]
    except IndexError:
        # print(f'No files found for instance {instance_id}: files={files}')
        return None
    with open(file_path, 'r') as f:
        result = json.load(f)
    # create messages
    messages = result['messages']
    messages.append(result['response']['choices'][0]['message'])
    tools = result['kwargs']['tools']
    return {
        'messages': messages,
        'tools': tools,
    }


parser = argparse.ArgumentParser()
parser.add_argument('jsonl_path', type=str)
args = parser.parse_args()

output_dir = os.path.dirname(args.jsonl_path)
df = pd.read_json(args.jsonl_path, lines=True, orient='records')
df['raw_completions'] = df['instance_id'].progress_apply(
    lambda x: load_completions(output_dir, x)
)
print(f'Successfully loaded {len(df)} completions')

output_path = os.path.join(output_dir, 'output.with_completions.jsonl')
if os.path.exists(output_path):
    print(f'Output file already exists at {output_path}, overwriting? (y/n)')
    if input() != 'y':
        print('Exiting...')
        exit(0)
# save to jsonl
df.to_json(output_path, lines=True, orient='records')
print(f'Saved to {output_path}')
