import { $ } from 'zx';

//https://dev.to/smac89/curl-to-docker-through-sockets-1mhe
//https://docs.docker.com/reference/api/engine/version/v1.47/#tag/Container/operation/ContainerList
export async function readContainerLabels() {
    //const d = await $`docker inspect --format '{{json .Config.Labels}}' $1`;
    //const labels = JSON.parse(d.stdout);
    //console.log(labels);

    // const v = await $`curl --silent --unix-socket /var/run/docker.sock http://v1.47/version`;
    // const version = JSON.parse(v.stdout);
    // console.log(version);

    const cs = await $`curl --silent --unix-socket /var/run/docker.sock http://v1.47/containers/json`;
    const containers = JSON.parse(cs.stdout);
    //console.log(containers);

    const runningContainers = containers.filter(c => c.State === 'running' || c.State === 'healthy');

    // runningContainers.map(c => {
    //     console.log(c.Names);
    //     console.log(c.Labels);
    // });

    return runningContainers;
}
