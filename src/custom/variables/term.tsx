import { addTerm, easyTerm } from '../../helpers/easy-term';

addTerm('network', <>Computers talking to each other through {easyTerm('request', 'requests')}.</>);
addTerm('request', <>A request is a {easyTerm('network')} thing.</>);
addTerm('latency', <>Time between a {easyTerm('request')} and its response.</>);
