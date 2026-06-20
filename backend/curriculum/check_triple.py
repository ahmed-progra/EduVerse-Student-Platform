for fn in ['gen_science.py', 'gen_science2.py', 'gen_science3.py']:
    data = open(fn, encoding='utf-8').read()
    count = data.count('"""')
    print(f'{fn}: {count} triple double quotes')
