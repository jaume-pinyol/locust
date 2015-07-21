from locust import HttpLocust, TaskSet, task
from PIL import Image

class GetImagesBehavior(TaskSet):
    @task(1)
    def get_image(self):
        with open('/Users/jaumepinyol/Documents/locust/locust/tests/pre-sample.txt') as f:
            for url in f:
                response = self.client.get(url.strip())
                bytes = response.content
                image = Image.frombytes('RGB', (), bytes)
                width, height = image.size

class WebsiteUser(HttpLocust):
    task_set = GetImagesBehavior
    min_wait = 5000
    max_wait = 9000
