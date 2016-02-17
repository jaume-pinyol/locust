import random
import string
from locust import HttpLocust, TaskSet, task
import logging
import hashlib

logger = logging.getLogger(__name__)
n = 10


def create_file(content):
    filename = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(n))
    filename = "{}/{}.{}".format("/Users/jaumepinyol/Documents/locust/locust/tests/images", filename, "jpg")
    logger.info("filename %s", filename)
    with open(filename, 'wb') as image_file:
        image_file.write(content)
        image_file.flush()
        image_file.close()


class GetImagesBehavior(TaskSet):
    '''@task(1)
    def get_image_europe(self):
        host_eu_west_1 = "http://pull.eu-west-1.images-pre.schibsted.io"
        region = "eu-west-1"
        self.get_image(host_eu_west_1, region)'''

    @task(1)
    def get_image_america(self):
        host = "https://pull.us-west-2.images-pre.schibsted.com"
        region = "us-west-2"
        self.get_image(host, region)

    '''@task(3)
    def get_image_europe_not_found(self):
        host = "http://pull.eu-west-1.images-pre.schibsted.io"
        region = "eu-west-1"
        with self.client.get("{}/{}".format(host, "smmx/images/not_found"), name="getImageNotFound-{}".format(region),
                             catch_response=True) as response:
             if response.status_code == 404:
                response.success()'''

    @task(3)
    def get_image_america_not_found(self):
        host = "https://pull.us-west-2.images-pre.schibsted.com"
        region = "us-west-2"
        with self.client.get("{}/{}".format(host, "smmx/images/not_found"), name="getImageNotFound-{}".format(region),
                             catch_response=True, verify=False) as response:
             if response.status_code == 404:
                response.success()

    def get_image(self, host, region):
        with open('/Users/jaumepinyol/Documents/locust/locust/tests/pre-sample.txt') as f:
            for url in f:
                self.client.get("{}/{}".format(host, url.strip()), name="getImage-{}".format(region), verify=False)
                '''with self.client.get(final_url, name="fetch_transformed_image") as response:
                    print response.headers
                    if md5_header in response.headers:
                        origin_md5 = response.headers[md5_header]
                        m = hashlib.md5()
                        m.update(response.content)
                        md5 = m.hexdigest()

                        if origin_md5 != md5:
                            print "{} different".format(url)
                            logger.error("Url: %s md5 header:%s != %s" % (url.strip(), origin_md5, md5))
                            create_file(response.content)
                            response.failure("Md5 does not match")
                    else:
                        print "{} nonoono".format(url)
                        logger.error("url: %s failed", url.strip())
                        response.failure("md5 missing")'''


class WebsiteUser(HttpLocust):
    task_set = GetImagesBehavior
    min_wait = 5000
    max_wait = 9000
    host = "http://pull.images-pre.schibsted.io"
