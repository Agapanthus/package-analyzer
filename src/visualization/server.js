var express = require('express');
var app = express();
var path = require('path');
var port = 3000;
var { spawn } = require('child_process');

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/analyze/:julia_package', (req, res) => {
   const julia_package = req.params.julia_package;
   const command = `rm /analyzer/src/visualization/dist/data.json; cd /analyzer && julia --project=. -e 'using analyzer; run_analysis("${julia_package}")' && cp res.json /analyzer/src/visualization/dist/data.json`;

   const child = spawn(command, { shell: true });

   child.stdout.on('data', (data) => {
      res.write(data);
   });

   child.stderr.on('data', (data) => {
      res.write(data);
   });

   child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      res.end('Command executed successfully');
   });
});

app.listen(port, function () {
   console.log('Listening on port ' + port)
})