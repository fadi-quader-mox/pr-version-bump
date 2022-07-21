git branch -D TEST-1
git checkout -b TEST-1
echo "Hello" >> test.txt
git add -A
git commit -m "update TEST-1"
git push origin TEST-1
git checkout main
git pu
