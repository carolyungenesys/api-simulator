var cpu_in_percentage = document.getElementById('cpu_in_percentage').getContext('2d');
var cpu_in_percentage_chart = new Chart(cpu_in_percentage, {
  type: 'line',
  data: {
    labels: [[label]],
    datasets: [{
      label: 'CPU In Percentage',
      data: [[cpu_in_percentage]],
      backgroundColor: "rgba(153,255,51,0.4)",
      pointRadius: 1
    }]
}
});

var handler_count = document.getElementById('handler_count').getContext('2d');
var handler_count_chart = new Chart(handler_count, {
  type: 'line',
  data: {
    labels: [[label]],
    datasets: [{
      label: 'Handler Count',
      data: [[handler_count]],
      backgroundColor: "rgba(153,66,51,0.4)",
      pointRadius: 1
    }]
}
});

var cpu_idle_time = document.getElementById('cpu_idle_time').getContext('2d');
var cpu_idle_time_chart = new Chart(cpu_idle_time, {
  type: 'line',
  data: {
    labels: [[label]],
    datasets: [{
      label: 'CPU Idle Time',
      data: [[cpu_idle_time]],
      backgroundColor: "rgba(166,255,251,0.4)",
      pointRadius: 1
    }]
}
});

var network_interface_time = document.getElementById('network_interface_time').getContext('2d');
var network_interface_time_chart = new Chart(network_interface_time, {
  type: 'line',
  data: {
    labels: [[label]],
    datasets: [{
      label: 'Network Interface Time',
      data: [[network_interface_time]],
      backgroundColor: "rgba(153,125,76,0.4)",
      pointRadius: 1
    }]
}
});

var thread_count = document.getElementById('thread_count').getContext('2d');
var thread_count_chart = new Chart(thread_count, {
  type: 'line',
  data: {
    labels: [[label]],
    datasets: [{
      label: 'Thread Count',
      data: [[thread_count]],
      backgroundColor: "rgba(255,77,11,0.4)",
      pointRadius: 1
    }]
}
});

var private_bytes = document.getElementById('private_bytes').getContext('2d');
var private_bytes_chart = new Chart(private_bytes, {
  type: 'line',
  data: {
    labels: [[label]],
    datasets: [{
      label: 'Private Bytes',
      data: [[private_bytes]],
      backgroundColor: "rgba(98,155,251,0.4)",
      pointRadius: 1
    }]
}
});

var iops = document.getElementById('iops').getContext('2d');
var iops_chart = new Chart(iops, {
  type: 'line',
  data: {
    labels: [[label]],
    datasets: [{
      label: 'IOPS',
      data: [[iops]],
      backgroundColor: "rgba(153,123,255,0.4)",
      pointRadius: 1
    }]
}
});