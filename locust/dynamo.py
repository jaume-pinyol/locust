import time
import json
import argparse
from boto import dynamodb, ec2, iam
from boto.sts import STSConnection

CONFIGURATION_TABLE_NAME = 'asgard-configuration'


def main(options):
    sts_connection = STSConnection()

    # conn = dynamodb.connect_to_region(options.region)
    assumedRoleObject = sts_connection.assume_role()

    conn = dynamodb.layer2.Layer2(region=options.region,
                                  aws_access_key_id=assumedRoleObject.credentials.access_key,
                                  aws_secret_access_key=assumedRoleObject.credentials.secret_key,
                                  security_token=assumedRoleObject.credentials.session_token)

    def create_table(name):
        table_schema = conn.create_schema(
            hash_key_name='Key',
            hash_key_proto_value=str
        )
        table = conn.create_table(
            name=name,
            schema=table_schema,
            read_units=2,
            write_units=1
        )
        return table

    try:
        create_table(CONFIGURATION_TABLE_NAME)
        time.sleep(5)
    except:
        pass

    table = conn.get_table(CONFIGURATION_TABLE_NAME)

    availability_zones = ",".join([zone.name for zone in ec2.connect_to_region(options.region).get_all_zones()])

    account_id = iam.connect_to_region(options.region).get_user().arn.split(':')[4]

    items = {
        'account_name': options.account_name,
        'account_environment': options.account_environment,
        'availability_zones': availability_zones,
        'account_id': account_id,
        'output_path': options.output_path,
        'output_path': options.output_path
    }

    if options.accounts:
        items['accounts'] = options.accounts

    if options.okta_credential:
        okta_config = json.load(open(options.okta_credential))
        items['okta_credential'] = json.dumps(okta_config)

    for key, value in items.iteritems():
        print key
        attrs = {'Key': key, 'Value': value}
        time.sleep(1)

        my_item = table.new_item(attrs=attrs)
        print my_item.put()
        # print attrs


def parse_options():
    parser = argparse.ArgumentParser(description='Output file')
    parser.add_argument("-r", '--region', help='region', required=True)
    parser.add_argument("-n", '--account_name', help='main account name', required=True)
    parser.add_argument("-e", '--account_environment', help='dev|pre|staging|prod', required=True)
    parser.add_argument("-o", '--output_path', help='output file', default="/usr/share/tomcat7/.asgard")
    parser.add_argument("-c", '--okta-credential', help='file with credentials')
    parser.add_argument("-a", '--accounts', help='additional accounts, i.e. 00000000:dev,11111111:pre')

    return parser.parse_args()


if __name__ == '__main__':
    options = parse_options()
    main(options)

# python dynamo_config_loader.py -r eu-west-1 -n data-pre -e pre [-c okta.json]
