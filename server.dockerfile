FROM julia:1.10.2-bookworm

RUN apt-get update && apt-get install -y npm

ADD ./Project.toml /analyzer/Project.toml
ADD ./Manifest.toml /analyzer/Manifest.toml
RUN cd /analyzer && julia -e "using Pkg; Pkg.activate(\".\"); Pkg.instantiate(); Pkg.precompile()"

ADD ./src /analyzer/src
ADD ./docs /analyzer/docs

RUN cd /analyzer/src/visualization && npm install && npm run build
RUN cd /analyzer/docs && julia --color=yes --project make.jl && cp /analyzer/docs/build /analyzer/src/visualization/dist/docs -r


CMD ["node", "server.js"]
#CMD ["sh", "-c", "tail -f /dev/null"]