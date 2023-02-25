NUM_NON_IMAGE_ARGS=2
NUM_IMAGES_TO_KEEP=1
NUM_UNRELATED_ARGS=$(( $NUM_NON_IMAGE_ARGS + $NUM_IMAGES_TO_KEEP ))
ZERO=0

num_args=$#
list_image_id=""

for (( i=1; i<=$num_args; i++ ))
do
  if [[ $i -gt $NUM_UNRELATED_ARGS ]]
  then
    list_image_id+="${!i} "
  fi
done

if [ -n "$list_image_id" ]; then
  docker image rm -f ${list_image_id}
fi