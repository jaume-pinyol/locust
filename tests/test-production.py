from locust import HttpLocust, TaskSet, task


class GetImagesBehavior(TaskSet):
    @task(1)
    def get_image(self):
        with open('/Users/jaumepinyol/Documents/locust/locust/tests/production-sample.txt') as f:
            for url in f:
                self.client.get(url.strip())


class WebsiteUser(HttpLocust):
    task_set = GetImagesBehavior
    min_wait = 5000
    max_wait = 9000
