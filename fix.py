p = r'C:\Users\PC25_728\Documents\project-choi_v1\backend\app\routers\analysis.py'
lines = open(p, encoding='utf-8').read().splitlines()
for i in range(400, min(550, len(lines))):
    if '"suggested_questions": [],' in lines[i]:
        lines[i] = lines[i].replace('"suggested_questions": [],', '"suggested_questions": llm_answer.get("suggested_questions", []),')
open(p, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
