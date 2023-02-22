STG="stg"
PROD="prod"
GCP="gcp"
LOCAL="local"

NAMESPACE="default"

service_name=""
application_name=""
cloud_env=""
env=""
without_deploy=""
pull_registry_domain="docker.io/library"
push_registry_domain="gcr.io/mno-b2b-bss-dev"


while true
do
    if [ -z $1 ]; then
      break
    fi

    case $1 in
      -a|--app-name) 
        application_name="$2"
        ;;
      -c|--cloud-env) 
        cloud_env="$2"
        ;;
      -e|--env) 
        env="$2"
        ;;
      -n|--without-deploy) 
        without_deploy="true"
        ;;
    esac
    shift
done

target_dockerfile="./Dockerfile"
deployment_name="${application_name}"
img_tag_prefix="${push_registry_domain}"

commit_id=$(git rev-parse --short HEAD)
current_time=$(date +%Y%m%d%H%M%S)

img_tag=${deployment_name}:${commit_id}_${current_time}
img_name=${img_tag_prefix}/${deployment_name}
remote_img_tag=${img_tag_prefix}/${img_tag}

# Phase1 Image build
# Note: "--platform" option is required if you build on non-amd architecture like Apple silicon
docker image build \
  --platform amd64 \
  -t ${remote_img_tag} \
  -f ${target_dockerfile} \
  --build-arg NODE_ENV=${env} \
  --build-arg REGISTRY_DOMAIN=${pull_registry_domain} \
  .

# Phase2 Tagging and pushing the image
docker tag ${img_tag} ${remote_img_tag}

if [ $cloud_env  != $LOCAL ]; then
  if [ -z $without_deploy ]; then
    # executed when $2 is null or an empty string
    docker push ${remote_img_tag}

    # Phase3 Update deployment
    kubectl set image deployment/${deployment_name} ${deployment_name}=${remote_img_tag}
  fi
fi

# Phase4 Remove old local images
docker image ls --filter=reference="${img_name}" --format "table {{.ID}}" | xargs sh ./deployment/remove_old_local_images.sh
